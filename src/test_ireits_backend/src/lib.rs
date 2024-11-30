use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::{query, update};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashMap;

mod token;
pub use token::{icrc7, management};

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Property {
    id: u64,
    owner: Principal,
    price: f64,
    location: String,
    description: String,
    status: PropertyStatus,
    token_id: Option<u64>,
    documents: Vec<Document>,
    rental_income: Option<RentalIncome>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RentalIncome {
    monthly_amount: u64,  // in cKUSDC/cKUSDT
    last_distribution: u64,  // timestamp
    distribution_frequency: u64,  // in seconds
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Document {
    id: u64,
    doc_type: DocumentType,
    hash: String,
    timestamp: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum DocumentType {
    Deed,
    Title,
    Contract,
    Inspection,
    Other,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum PropertyStatus {
    Available,
    Tokenized,
    UnderContract,
    Sold,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Transaction {
    id: u64,
    property_id: u64,
    seller: Principal,
    buyer: Principal,
    price: f64,
    status: TransactionStatus,
    timestamp: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransactionStatus {
    Pending,
    Completed,
    Cancelled,
}

thread_local! {
    static PROPERTIES: RefCell<HashMap<u64, Property>> = RefCell::new(HashMap::new());
    static TRANSACTIONS: RefCell<HashMap<u64, Transaction>> = RefCell::new(HashMap::new());
    static PROPERTY_COUNTER: RefCell<u64> = RefCell::new(0);
    static TRANSACTION_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[update]
fn list_property(
    price: f64, 
    location: String, 
    description: String,
    rental_income: Option<RentalIncome>
) -> Property {
    let caller = ic_caller();

    PROPERTY_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        let property_id = *count;

        let property = Property {
            id: property_id,
            owner: caller,
            price,
            location,
            description,
            status: PropertyStatus::Available,
            token_id: None,
            documents: Vec::new(),
            rental_income,
        };

        PROPERTIES.with(|properties| {
            properties.borrow_mut().insert(property_id, property.clone());
        });

        property
    })
}

#[update]
fn tokenize_property(
    property_id: u64,
    token_name: String,
    token_symbol: String,
    token_description: Option<String>,
    total_supply: u64,
    price_per_token: u64,
    royalties: Option<u16>,
) -> Option<u64> {
    let caller = ic_caller();

    PROPERTIES.with(|properties| {
        let mut properties_ref = properties.borrow_mut();
        let property = properties_ref.get_mut(&property_id)?;

        if property.owner != caller || property.token_id.is_some() {
            return None;
        }

        let metadata = token::TokenMetadata {
            name: token_name,
            symbol: token_symbol,
            description: token_description,
            image: None,
            royalties,
            royalty_recipient: Some(caller),
        };

        let token_id = management::mint_property_token(
            property_id,
            metadata,
            total_supply,
            price_per_token,
        )?;

        property.token_id = Some(token_id);
        property.status = PropertyStatus::Tokenized;

        Some(token_id)
    })
}

#[update]
fn distribute_rental_income(property_id: u64) -> bool {
    let caller = ic_caller();

    PROPERTIES.with(|properties| {
        let mut properties_ref = properties.borrow_mut();
        let property = properties_ref.get_mut(&property_id)?;

        if property.owner != caller {
            return None;
        }

        let rental_income = property.rental_income.as_ref()?;
        let token_id = property.token_id?;

        // Get token details
        let token = management::get_token(token_id)?;
        let total_supply = token.total_supply;

        // Calculate distribution
        let current_time = ic_cdk::api::time();
        let time_since_last = current_time - rental_income.last_distribution;
        
        if time_since_last < rental_income.distribution_frequency {
            return None;
        }

        // TODO: Implement actual distribution logic with cKUSDC/cKUSDT transfers
        // For each token holder:
        // 1. Calculate their share based on token ownership
        // 2. Transfer the appropriate amount of cKUSDC/cKUSDT

        property.rental_income.as_mut()?.last_distribution = current_time;
        Some(true)
    }).unwrap_or(false)
}

#[query]
fn get_property(property_id: u64) -> Option<Property> {
    PROPERTIES.with(|properties| properties.borrow().get(&property_id).cloned())
}

#[update]
fn initiate_transaction(property_id: u64) -> u64 {
    let buyer = ic_caller();

    PROPERTIES.with(|properties| {
        let mut properties_ref = properties.borrow_mut();
        let property = properties_ref
            .get(&property_id)
            .expect("Property not found")
            .clone();

        assert!(
            matches!(property.status, PropertyStatus::Available),
            "Property is not available"
        );

        TRANSACTION_COUNTER.with(|counter| {
            let mut count = counter.borrow_mut();
            *count += 1;
            let transaction_id = *count;

            let transaction = Transaction {
                id: transaction_id,
                property_id,
                seller: property.owner,
                buyer,
                price: property.price,
                status: TransactionStatus::Pending,
                timestamp: ic_cdk::api::time(),
            };

            TRANSACTIONS.with(|transactions| {
                transactions.borrow_mut().insert(transaction_id, transaction);
            });

            // Update property status
            let mut updated_property = property.clone();
            updated_property.status = PropertyStatus::UnderContract;
            properties_ref.insert(property_id, updated_property);

            transaction_id
        })
    })
}

#[update]
fn complete_transaction(transaction_id: u64) -> bool {
    let caller = ic_caller();

    TRANSACTIONS.with(|transactions| {
        let mut transactions_ref = transactions.borrow_mut();
        let transaction = transactions_ref
            .get(&transaction_id)
            .expect("Transaction not found")
            .clone();

        assert!(
            transaction.seller == caller,
            "Only seller can complete the transaction"
        );

        assert!(
            matches!(transaction.status, TransactionStatus::Pending),
            "Transaction is not pending"
        );

        PROPERTIES.with(|properties| {
            let mut properties_ref = properties.borrow_mut();
            let mut property = properties_ref
                .get(&transaction.property_id)
                .expect("Property not found")
                .clone();

            property.status = PropertyStatus::Sold;
            property.owner = transaction.buyer;
            properties_ref.insert(transaction.property_id, property);

            let mut updated_transaction = transaction.clone();
            updated_transaction.status = TransactionStatus::Completed;
            transactions_ref.insert(transaction_id, updated_transaction);

            true
        })
    })
}

#[update]
fn add_document(property_id: u64, doc_type: DocumentType, hash: String) -> bool {
    let caller = ic_caller();

    PROPERTIES.with(|properties| {
        let mut properties_ref = properties.borrow_mut();
        let mut property = properties_ref
            .get(&property_id)
            .expect("Property not found")
            .clone();

        assert!(
            property.owner == caller,
            "Only the property owner can add documents"
        );

        let document = Document {
            id: property.documents.len() as u64,
            doc_type,
            hash,
            timestamp: ic_cdk::api::time(),
        };

        property.documents.push(document);
        properties_ref.insert(property_id, property);

        true
    })
}

#[query]
fn get_all_properties() -> Vec<Property> {
    PROPERTIES.with(|properties| properties.borrow().values().cloned().collect())
}

#[query]
fn get_user_properties(user: Principal) -> Vec<Property> {
    PROPERTIES.with(|properties| {
        properties
            .borrow()
            .values()
            .filter(|p| p.owner == user)
            .cloned()
            .collect()
    })
}

#[query]
fn get_transaction(transaction_id: u64) -> Option<Transaction> {
    TRANSACTIONS.with(|transactions| transactions.borrow().get(&transaction_id).cloned())
}

#[update]
fn assign_agent(property_id: u64, agent: Principal) -> bool {
    PROPERTIES.with(|properties| {
        let mut properties_ref = properties.borrow_mut();
        let property = properties_ref
            .get_mut(&property_id)
            .expect("Property not found");

        property.owner = agent;
        true
    })
}

#[ic_cdk::init]
fn init() {
    PROPERTY_COUNTER.with(|counter| *counter.borrow_mut() = 0);
    TRANSACTION_COUNTER.with(|counter| *counter.borrow_mut() = 0);
}
