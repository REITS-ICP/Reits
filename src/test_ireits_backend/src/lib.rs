use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

mod token;
mod payments;
pub use token::{icrc7, management};
pub use payments::{PaymentManager, PaymentError};

thread_local! {
    static PROPERTIES: RefCell<HashMap<u64, Property>> = RefCell::new(HashMap::new());
    static TRANSACTIONS: RefCell<HashMap<u64, Transaction>> = RefCell::new(HashMap::new());
    static PROPERTY_COUNTER: RefCell<u64> = RefCell::new(0);
    static TRANSACTION_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Document {
    pub id: u64,
    pub doc_type: DocumentType,
    pub hash: String,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum DocumentType {
    Deed,
    Title,
    Contract,
    Inspection,
    Other,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct RentalIncome {
    pub monthly_amount: u64,
    pub last_distribution: u64,
    pub distribution_frequency: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Property {
    pub id: u64,
    pub owner: Principal,
    pub price: f64,
    pub location: String,
    pub description: String,
    pub status: PropertyStatus,
    pub token_id: Option<u64>,
    pub documents: Vec<Document>,
    pub rental_income: Option<RentalIncome>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PropertyStatus {
    Available,
    Tokenized,
    UnderContract,
    Sold,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Transaction {
    pub id: u64,
    pub property_id: u64,
    pub seller: Principal,
    pub buyer: Principal,
    pub price: f64,
    pub status: TransactionStatus,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransactionStatus {
    Pending,
    Completed,
    Cancelled,
}

// Property Management
#[update]
fn list_property(price: f64, location: String, description: String, rental_income: Option<RentalIncome>) -> Property {
    let caller = ic_caller();
    
    PROPERTY_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        let id = *count;
        
        let property = Property {
            id,
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
            properties.borrow_mut().insert(id, property.clone());
        });
        
        property
    })
}

#[query]
fn get_property(property_id: u64) -> Option<Property> {
    PROPERTIES.with(|properties| properties.borrow().get(&property_id).cloned())
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

#[update]
fn add_document(property_id: u64, doc_type: DocumentType, hash: String) -> bool {
    let caller = ic_caller();
    
    PROPERTIES.with(|properties| {
        let mut properties = properties.borrow_mut();
        if let Some(property) = properties.get_mut(&property_id) {
            if property.owner != caller {
                return false;
            }
            
            let document = Document {
                id: property.documents.len() as u64 + 1,
                doc_type,
                hash,
                timestamp: ic_cdk::api::time(),
            };
            
            property.documents.push(document);
            true
        } else {
            false
        }
    })
}

// Transaction Management
#[update]
fn initiate_transaction(property_id: u64) -> u64 {
    let caller = ic_caller();
    
    TRANSACTION_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        let id = *count;
        
        let property = PROPERTIES.with(|properties| {
            properties.borrow().get(&property_id).cloned()
        }).expect("Property not found");
        
        let transaction = Transaction {
            id,
            property_id,
            seller: property.owner,
            buyer: caller,
            price: property.price,
            status: TransactionStatus::Pending,
            timestamp: ic_cdk::api::time(),
        };
        
        TRANSACTIONS.with(|transactions| {
            transactions.borrow_mut().insert(id, transaction);
        });
        
        id
    })
}

#[update]
fn complete_transaction(transaction_id: u64) -> bool {
    let caller = ic_caller();
    
    TRANSACTIONS.with(|transactions| {
        let mut transactions = transactions.borrow_mut();
        if let Some(transaction) = transactions.get_mut(&transaction_id) {
            if transaction.seller != caller {
                return false;
            }
            
            transaction.status = TransactionStatus::Completed;
            
            PROPERTIES.with(|properties| {
                let mut properties = properties.borrow_mut();
                if let Some(property) = properties.get_mut(&transaction.property_id) {
                    property.owner = transaction.buyer;
                    property.status = PropertyStatus::Sold;
                }
            });
            
            true
        } else {
            false
        }
    })
}

#[query]
fn get_transaction(transaction_id: u64) -> Option<Transaction> {
    TRANSACTIONS.with(|transactions| transactions.borrow().get(&transaction_id).cloned())
}

// Token Management (ICRC-7)
#[query]
fn name() -> String {
    icrc7::name()
}

#[query]
fn symbol() -> String {
    icrc7::symbol()
}

#[query]
fn total_supply() -> u64 {
    icrc7::total_supply()
}

#[query]
fn owner_of(token_id: u64) -> Option<Principal> {
    icrc7::owner_of(token_id)
}

#[query]
fn balance_of(owner: Principal) -> u64 {
    icrc7::balance_of(owner)
}

#[update]
fn transfer(args: token::TransferArgs) -> Result<bool, String> {
    icrc7::transfer(args)
}

#[update]
fn approve(args: token::ApprovalArgs) -> Result<bool, String> {
    icrc7::approve(args)
}

#[query]
fn get_approved(token_id: u64) -> Option<(Principal, Option<u64>)> {
    icrc7::get_approved(token_id)
}

// Property Token Management
#[update]
fn initialize_collection(name: String, symbol: String, description: String, royalties: u16, treasury: Principal) -> bool {
    management::initialize_collection(name, symbol, description, royalties, treasury)
}

#[update]
fn mint_property_token(
    property_id: u64,
    metadata: token::TokenMetadata,
    total_supply: u64,
    price_per_token: u64,
    use_usdt: bool,
) -> Option<u64> {
    let caller = ic_caller();
    
    // Verify property ownership
    let owns_property = PROPERTIES.with(|properties| {
        properties
            .borrow()
            .get(&property_id)
            .map(|p| p.owner == caller)
            .unwrap_or(false)
    });

    if !owns_property {
        return None;
    }

    let token_id = management::mint_token(
        caller,
        metadata,
        property_id,
        total_supply,
        price_per_token,
        use_usdt,
    )?;

    // Update property status
    PROPERTIES.with(|properties| {
        let mut properties = properties.borrow_mut();
        if let Some(property) = properties.get_mut(&property_id) {
            property.status = PropertyStatus::Tokenized;
            property.token_id = Some(token_id);
        }
    });

    Some(token_id)
}

#[query]
fn get_token(token_id: u64) -> Option<token::PropertyToken> {
    management::get_token(token_id)
}

#[query]
fn get_user_tokens(user: Principal) -> Vec<token::PropertyToken> {
    management::get_user_tokens(user)
}

#[update]
async fn purchase_tokens(token_id: u64, amount: u64) -> Result<bool, String> {
    management::purchase_tokens(token_id, amount).await
}

// Property Tokenization
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
    let metadata = token::TokenMetadata {
        name: token_name,
        symbol: token_symbol,
        description: token_description,
        image: None,
        royalties,
        royalty_recipient: Some(ic_caller()),
    };

    mint_property_token(property_id, metadata, total_supply, price_per_token, false)
}

// Rental Income Distribution
#[update]
async fn distribute_token_income(total_amount: u64, use_usdt: bool) -> Result<bool, String> {
    management::distribute_token_income(total_amount, use_usdt).await
}

// Payment Management
#[update]
fn initialize_payment_manager(ckusdc_id: Principal, ckusdt_id: Principal) {
    management::initialize_payment_manager(ckusdc_id, ckusdt_id);
}

#[ic_cdk::init]
fn init() {
    PROPERTY_COUNTER.with(|counter| *counter.borrow_mut() = 0);
    TRANSACTION_COUNTER.with(|counter| *counter.borrow_mut() = 0);
}
