use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

mod icrc7_token;
mod payments;

use icrc7_token::{ICRC7Token, TokenMetadata, Token, Collection, TokenStats, TransferArgs, ApprovalArgs};
use payments::{PaymentManager, PaymentError};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Property {
    pub id: u64,
    pub owner: Principal,
    pub price: f64,
    pub location: String,
    pub description: String,
    pub status: PropertyStatus,
    pub documents: Vec<Document>,
    pub rental_income: Option<RentalIncome>,
    pub token_id: Option<u64>,
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
pub enum PropertyStatus {
    Listed,
    UnderContract,
    Sold,
    Tokenized,
}

thread_local! {
    static PROPERTIES: RefCell<HashMap<u64, Property>> = RefCell::new(HashMap::new());
    static PROPERTY_COUNTER: RefCell<u64> = RefCell::new(0);
}

// Property Management
#[update]
fn list_property(price: f64, location: String, description: String, rental_income: Option<RentalIncome>) -> Property {
    let caller = ic_caller();
    let id = PROPERTY_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        *counter
    });
    
    let property = Property {
        id,
        owner: caller,
        price,
        location,
        description,
        status: PropertyStatus::Listed,
        documents: Vec::new(),
        rental_income,
        token_id: None,
    };
    
    PROPERTIES.with(|properties| {
        properties.borrow_mut().insert(id, property.clone());
    });
    
    property
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
    let timestamp = ic_cdk::api::time();
    
    PROPERTIES.with(|properties| {
        let mut properties = properties.borrow_mut();
        if let Some(property) = properties.get_mut(&property_id) {
            if property.owner != caller {
                return false;
            }
            
            let doc_id = property.documents.len() as u64 + 1;
            property.documents.push(Document {
                id: doc_id,
                doc_type,
                hash,
                timestamp,
            });
            true
        } else {
            false
        }
    })
}

// Token Management (ICRC-7)
#[query]
fn name() -> String {
    ICRC7Token::name()
}

#[query]
fn symbol() -> String {
    ICRC7Token::symbol()
}

#[query]
fn total_supply() -> u64 {
    ICRC7Token::total_supply()
}

#[query]
fn owner_of(token_id: u64) -> Option<Principal> {
    ICRC7Token::owner_of(token_id)
}

#[query]
fn balance_of(owner: Principal) -> u64 {
    ICRC7Token::balance_of(owner)
}

#[update]
fn transfer(args: TransferArgs) -> Result<bool, String> {
    ICRC7Token::transfer(args)
}

#[update]
fn approve(args: ApprovalArgs) -> Result<bool, String> {
    ICRC7Token::approve(args)
}

#[query]
fn get_approved(token_id: u64) -> Option<(Principal, Option<u64>)> {
    ICRC7Token::get_approved(token_id)
}

// Property Token Management
#[update]
fn initialize_collection(
    name: String,
    symbol: String,
    description: String,
    royalties: u16,
    treasury: Principal,
    max_supply: Option<u64>,
    logo: Option<Vec<u8>>,
    website: Option<String>,
    social_links: Option<Vec<String>>,
) -> bool {
    ICRC7Token::initialize_collection(
        name,
        symbol,
        description,
        royalties,
        treasury,
        max_supply,
        logo,
        website,
        social_links,
    )
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

    let metadata = TokenMetadata {
        name: token_name,
        symbol: token_symbol,
        description: token_description,
        logo: None,
        content_type: None,
        decimals: 0,
        website: None,
        social_links: None,
        supply_cap: Some(total_supply),
        image: None,
        royalties,
        royalty_recipient: Some(caller),
        tags: Some(vec!["REIT".to_string(), "Property".to_string()]),
        created_at: ic_cdk::api::time(),
        modified_at: ic_cdk::api::time(),
    };

    let token_id = ICRC7Token::mint(caller, metadata, false)?;

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
fn get_token(token_id: u64) -> Option<Token> {
    ICRC7Token::get_token(token_id)
}

#[query]
fn get_user_tokens(user: Principal) -> Vec<Token> {
    ICRC7Token::get_user_tokens(user)
}

#[query]
fn get_metadata(token_id: u64) -> Option<TokenMetadata> {
    ICRC7Token::get_metadata(token_id)
}

#[query]
fn get_token_stats(token_id: u64) -> Option<TokenStats> {
    ICRC7Token::get_token_stats(token_id)
}

#[query]
fn get_collection_info() -> Option<Collection> {
    ICRC7Token::get_collection_info()
}

// Payment Management
#[update]
fn initialize_payment_manager(ckusdc_id: Principal, ckusdt_id: Principal) {
    payments::initialize_payment_manager(ckusdc_id, ckusdt_id);
}

#[ic_cdk::init]
fn init() {
    PROPERTY_COUNTER.with(|counter| *counter.borrow_mut() = 0);
}
