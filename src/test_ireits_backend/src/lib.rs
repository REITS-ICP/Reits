use candid::{CandidType, Deserialize, Principal};
use std::cell::RefCell;
use std::collections::HashMap;

mod icrc7_token;
mod ret_token;
mod marketplace;
mod payments;
mod types;

use types::TokenType;
use ret_token::{RETToken, TokenMetadata as RETTokenMetadata, TokenStats, TransferArgs};
use icrc7_token::{ICRC7Token, TokenMetadata as ICRC7TokenMetadata};

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
pub enum PropertyStatus {
    Listed,
    UnderContract,
    Sold,
    Tokenized,
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

thread_local! {
    static OWNER: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static PROPERTY_COUNTER: RefCell<u64> = RefCell::new(0);
    static PROPERTIES: RefCell<HashMap<u64, Property>> = RefCell::new(HashMap::new());
}

#[ic_cdk_macros::init]
fn init() {
    let caller = ic_cdk::api::caller();
    OWNER.with(|owner| {
        *owner.borrow_mut() = caller;
    });
}

// RET Token Management
#[ic_cdk_macros::update]
fn initialize_ret(owner: Principal, website: Option<String>, social_links: Option<Vec<String>>) -> bool {
    RETToken::initialize(owner, website, social_links)
}

#[ic_cdk_macros::query]
fn get_ret_metadata() -> Option<RETTokenMetadata> {
    RETToken::get_metadata()
}

#[ic_cdk_macros::query]
fn balance_of(owner: Principal) -> u64 {
    RETToken::balance_of(owner)
}

#[ic_cdk_macros::query]
fn staked_balance_of(owner: Principal) -> u64 {
    RETToken::staked_balance_of(owner)
}

#[ic_cdk_macros::update]
fn stake(amount: u64, duration: u64) -> Result<bool, String> {
    RETToken::stake(amount, duration)
}

#[ic_cdk_macros::update]
fn unstake() -> Result<u64, String> {
    RETToken::unstake()
}

#[ic_cdk_macros::update]
fn transfer(args: TransferArgs) -> Result<bool, String> {
    RETToken::transfer(args)
}

#[ic_cdk_macros::update]
fn airdrop_ret(recipients: Vec<(Principal, u64)>) -> Result<bool, String> {
    RETToken::airdrop(recipients)
}

#[ic_cdk_macros::query]
fn get_ret_stats() -> TokenStats {
    RETToken::get_stats()
}

// Payment Management
#[ic_cdk_macros::update]
fn initialize_payment_manager(ret_ledger: Principal) {
    let caller = ic_cdk::api::caller();
    OWNER.with(|owner| {
        assert_eq!(caller, *owner.borrow(), "Only owner can initialize payment manager");
    });
    payments::initialize_payment_manager(ret_ledger);
}

// Property Management
#[ic_cdk_macros::update]
fn list_property(price: f64, location: String, description: String, rental_income: Option<RentalIncome>) -> Property {
    let caller = ic_cdk::api::caller();
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

#[ic_cdk_macros::query]
fn get_property(property_id: u64) -> Option<Property> {
    PROPERTIES.with(|properties| properties.borrow().get(&property_id).cloned())
}

#[ic_cdk_macros::query]
fn get_all_properties() -> Vec<Property> {
    PROPERTIES.with(|properties| properties.borrow().values().cloned().collect())
}

#[ic_cdk_macros::query]
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

#[ic_cdk_macros::update]
fn add_document(property_id: u64, doc_type: DocumentType, hash: String) -> bool {
    let caller = ic_cdk::api::caller();
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

#[ic_cdk_macros::update]
fn test_advance_time(duration_nanos: u64) -> Result<bool, String> {
    #[cfg(test)]
    {
        // Only allow time advancement in test mode
        Ok(true)
    }
    #[cfg(not(test))]
    {
        Err("Time advancement only allowed in test mode".to_string())
    }
}

#[ic_cdk_macros::update]
fn tokenize_property(
    property_id: u64,
    name: String,
    symbol: String,
    description: Option<String>,
    total_supply: u64,
    available_supply: u64,
    royalty_percentage: Option<u16>,
) -> Result<bool, String> {
    let caller = ic_cdk::api::caller();
    
    // Verify property ownership
    PROPERTIES.with(|properties| {
        let mut properties = properties.borrow_mut();
        let property = properties.get_mut(&property_id)
            .ok_or("Property not found")?;
        
        if property.owner != caller {
            return Err("Not the property owner".to_string());
        }
        
        if property.token_id.is_some() {
            return Err("Property already tokenized".to_string());
        }
        
        // Create ICRC7 token
        let token_metadata = ICRC7TokenMetadata {
            name,
            symbol,
            description,
            logo: None,
            content_type: None,
            decimals: 0,
            website: None,
            social_links: None,
            supply_cap: Some(total_supply),
            image: None,
            royalties: royalty_percentage,
            royalty_recipient: Some(caller),
            tags: Some(vec!["real-estate".to_string()]),
            created_at: ic_cdk::api::time(),
            modified_at: ic_cdk::api::time(),
        };
        
        let token_id = ICRC7Token::mint(caller, token_metadata, false)
            .ok_or("Failed to mint token")?;
        
        // Update property status
        property.status = PropertyStatus::Tokenized;
        property.token_id = Some(token_id);
        
        Ok(true)
    })
}

#[ic_cdk_macros::update]
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

#[ic_cdk_macros::update]
fn fractionalize_property(
    property_id: u64,
    shares: Vec<(Principal, u16)>,
) -> Result<bool, String> {
    let caller = ic_cdk::api::caller();
    
    // Verify property ownership
    PROPERTIES.with(|properties| {
        let properties = properties.borrow();
        let property = properties.get(&property_id)
            .ok_or("Property not found")?;
        
        if property.owner != caller {
            return Err("Not the property owner".to_string());
        }
        
        if property.token_id.is_none() {
            return Err("Property not tokenized".to_string());
        }
        
        let token_id = property.token_id.unwrap();
        
        // Verify caller owns the token
        if !ICRC7Token::owner_of(token_id)
            .map(|owner| owner == caller)
            .unwrap_or(false) {
            return Err("Not the token owner".to_string());
        }
        
        // Call marketplace to fractionalize
        marketplace::Marketplace::fractionalize_property(property_id, shares)
            .map(|_| true)
    })
}
