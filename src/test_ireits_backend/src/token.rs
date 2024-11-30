use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

use crate::payments::{PaymentManager, PaymentError};

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub description: Option<String>,
    pub image: Option<Vec<u8>>,
    pub royalties: Option<u16>, // basis points (e.g., 250 = 2.5%)
    pub royalty_recipient: Option<Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PropertyToken {
    pub token_id: u64,
    pub owner: Principal,
    pub metadata: TokenMetadata,
    pub property_id: u64,
    pub total_supply: u64,
    pub price_per_token: u64, // in cKUSDC/cKUSDT
    pub available_supply: u64,
    pub use_usdt: bool, // true for USDT, false for USDC
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Collection {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub total_supply: u64,
    pub royalties: u16,
    pub owner: Principal,
    pub treasury: Principal,
}

thread_local! {
    static TOKENS: RefCell<HashMap<u64, PropertyToken>> = RefCell::new(HashMap::new());
    static TOKEN_OWNERS: RefCell<HashMap<Principal, HashSet<u64>>> = RefCell::new(HashMap::new());
    static COLLECTION: RefCell<Option<Collection>> = RefCell::new(None);
    static TOKEN_COUNTER: RefCell<u64> = RefCell::new(0);
    static PAYMENT_MANAGER: RefCell<Option<PaymentManager>> = RefCell::new(None);
}

pub fn initialize_payment_manager(ckusdc_id: Principal, ckusdt_id: Principal) {
    PAYMENT_MANAGER.with(|manager| {
        *manager.borrow_mut() = Some(PaymentManager::new(ckusdc_id, ckusdt_id));
    });
}

// ICRC-7 Standard Implementation
pub mod icrc7 {
    use super::*;

    #[ic_cdk::query]
    pub fn name() -> String {
        COLLECTION.with(|collection| {
            collection
                .borrow()
                .as_ref()
                .expect("Collection not initialized")
                .name
                .clone()
        })
    }

    #[ic_cdk::query]
    pub fn symbol() -> String {
        COLLECTION.with(|collection| {
            collection
                .borrow()
                .as_ref()
                .expect("Collection not initialized")
                .symbol
                .clone()
        })
    }

    #[ic_cdk::query]
    pub fn total_supply() -> u64 {
        COLLECTION.with(|collection| {
            collection
                .borrow()
                .as_ref()
                .expect("Collection not initialized")
                .total_supply
        })
    }

    #[ic_cdk::query]
    pub fn owner_of(token_id: u64) -> Option<Principal> {
        TOKENS.with(|tokens| tokens.borrow().get(&token_id).map(|token| token.owner))
    }

    #[ic_cdk::query]
    pub fn balance_of(owner: Principal) -> u64 {
        TOKEN_OWNERS.with(|owners| {
            owners
                .borrow()
                .get(&owner)
                .map_or(0, |tokens| tokens.len() as u64)
        })
    }

    #[ic_cdk::update]
    pub async fn transfer(to: Principal, token_id: u64) -> Result<bool, String> {
        let caller = ic_caller();
        
        TOKENS.with(|tokens| {
            let mut tokens_ref = tokens.borrow_mut();
            if let Some(token) = tokens_ref.get_mut(&token_id) {
                if token.owner != caller {
                    return Err("Not token owner".to_string());
                }

                // Handle royalties if configured
                if let Some(royalties) = token.metadata.royalties {
                    if let Some(recipient) = token.metadata.royalty_recipient {
                        let royalty_amount = (token.price_per_token * royalties as u64) / 10000;
                        
                        // Process royalty payment
                        PAYMENT_MANAGER.with(|manager| {
                            if let Some(manager) = manager.borrow().as_ref() {
                                if let Err(e) = ic_cdk::block_on(manager.process_payment(
                                    to,
                                    recipient,
                                    royalty_amount,
                                    token.use_usdt,
                                )) {
                                    return Err(format!("Royalty payment failed: {}", e.message));
                                }
                            }
                        });
                    }
                }

                token.owner = to;
                
                // Update token owners
                TOKEN_OWNERS.with(|owners| {
                    let mut owners_ref = owners.borrow_mut();
                    
                    // Remove from previous owner
                    if let Some(caller_tokens) = owners_ref.get_mut(&caller) {
                        caller_tokens.remove(&token_id);
                    }
                    
                    // Add to new owner
                    owners_ref
                        .entry(to)
                        .or_insert_with(HashSet::new)
                        .insert(token_id);
                });
                
                Ok(true)
            } else {
                Err("Token not found".to_string())
            }
        })
    }
}

// Property Token Management
pub mod management {
    use super::*;

    #[ic_cdk::update]
    pub fn initialize_collection(
        name: String,
        symbol: String,
        description: String,
        royalties: u16,
        treasury: Principal,
    ) -> bool {
        let caller = ic_caller();
        
        COLLECTION.with(|collection| {
            if collection.borrow().is_some() {
                return false;
            }
            
            *collection.borrow_mut() = Some(Collection {
                name,
                symbol,
                description,
                total_supply: 0,
                royalties,
                owner: caller,
                treasury,
            });
            
            true
        })
    }

    #[ic_cdk::update]
    pub fn mint_property_token(
        property_id: u64,
        metadata: TokenMetadata,
        total_supply: u64,
        price_per_token: u64,
        use_usdt: bool,
    ) -> Option<u64> {
        let caller = ic_caller();
        
        COLLECTION.with(|collection| {
            let mut coll = collection.borrow_mut();
            let coll = coll.as_mut()?;
            
            if coll.owner != caller {
                return None;
            }
            
            TOKEN_COUNTER.with(|counter| {
                let mut count = counter.borrow_mut();
                *count += 1;
                let token_id = *count;
                
                let token = PropertyToken {
                    token_id,
                    owner: caller,
                    metadata,
                    property_id,
                    total_supply,
                    price_per_token,
                    available_supply: total_supply,
                    use_usdt,
                };
                
                TOKENS.with(|tokens| {
                    tokens.borrow_mut().insert(token_id, token);
                });
                
                TOKEN_OWNERS.with(|owners| {
                    owners
                        .borrow_mut()
                        .entry(caller)
                        .or_insert_with(HashSet::new)
                        .insert(token_id);
                });
                
                coll.total_supply += 1;
                Some(token_id)
            })
        })
    }

    #[ic_cdk::query]
    pub fn get_token(token_id: u64) -> Option<PropertyToken> {
        TOKENS.with(|tokens| tokens.borrow().get(&token_id).cloned())
    }

    #[ic_cdk::query]
    pub fn get_user_tokens(user: Principal) -> Vec<PropertyToken> {
        TOKEN_OWNERS.with(|owners| {
            if let Some(token_ids) = owners.borrow().get(&user) {
                TOKENS.with(|tokens| {
                    let tokens_ref = tokens.borrow();
                    token_ids
                        .iter()
                        .filter_map(|id| tokens_ref.get(id))
                        .cloned()
                        .collect()
                })
            } else {
                Vec::new()
            }
        })
    }

    #[ic_cdk::update]
    pub async fn purchase_tokens(token_id: u64, amount: u64) -> Result<bool, String> {
        let caller = ic_caller();
        
        TOKENS.with(|tokens| {
            let mut tokens_ref = tokens.borrow_mut();
            if let Some(token) = tokens_ref.get_mut(&token_id) {
                if token.available_supply < amount {
                    return Err("Insufficient available supply".to_string());
                }
                
                let total_cost = token.price_per_token * amount;
                
                // Process payment
                PAYMENT_MANAGER.with(|manager| {
                    if let Some(manager) = manager.borrow().as_ref() {
                        // Get treasury address from collection
                        let treasury = COLLECTION.with(|collection| {
                            collection.borrow().as_ref()
                                .map(|c| c.treasury)
                                .ok_or("Collection not initialized".to_string())
                        })?;

                        if let Err(e) = ic_cdk::block_on(manager.process_payment(
                            caller,
                            treasury,
                            total_cost,
                            token.use_usdt,
                        )) {
                            return Err(format!("Payment failed: {}", e.message));
                        }
                    } else {
                        return Err("Payment manager not initialized".to_string());
                    }
                });
                
                token.available_supply -= amount;
                
                // Create new token for the buyer
                TOKEN_COUNTER.with(|counter| {
                    let mut count = counter.borrow_mut();
                    *count += 1;
                    let new_token_id = *count;
                    
                    let new_token = PropertyToken {
                        token_id: new_token_id,
                        owner: caller,
                        metadata: token.metadata.clone(),
                        property_id: token.property_id,
                        total_supply: amount,
                        price_per_token: token.price_per_token,
                        available_supply: amount,
                        use_usdt: token.use_usdt,
                    };
                    
                    tokens_ref.insert(new_token_id, new_token);
                    
                    TOKEN_OWNERS.with(|owners| {
                        owners
                            .borrow_mut()
                            .entry(caller)
                            .or_insert_with(HashSet::new)
                            .insert(new_token_id);
                    });
                });
                
                Ok(true)
            } else {
                Err("Token not found".to_string())
            }
        })
    }

    #[ic_cdk::update]
    pub async fn distribute_token_income(
        token_id: u64,
        total_amount: u64,
        use_usdt: bool,
    ) -> Result<bool, String> {
        let caller = ic_caller();
        
        // Get all token holders and their proportions
        let distributions = TOKEN_OWNERS.with(|owners| {
            let mut distributions = Vec::new();
            let owners_ref = owners.borrow();
            
            for (owner, tokens) in owners_ref.iter() {
                let owner_amount = tokens.iter()
                    .filter_map(|tid| TOKENS.with(|t| t.borrow().get(tid).map(|token| token.total_supply)))
                    .sum::<u64>();
                
                if owner_amount > 0 {
                    let proportion = (owner_amount as f64) / (total_amount as f64);
                    let distribution_amount = (total_amount as f64 * proportion) as u64;
                    distributions.push((*owner, distribution_amount));
                }
            }
            
            distributions
        });

        // Process distributions
        PAYMENT_MANAGER.with(|manager| {
            if let Some(manager) = manager.borrow().as_ref() {
                if let Err(e) = ic_cdk::block_on(manager.distribute_income(
                    caller,
                    distributions,
                    use_usdt,
                )) {
                    return Err(format!("Distribution failed: {}", e.message));
                }
                Ok(true)
            } else {
                Err("Payment manager not initialized".to_string())
            }
        })
    }
} 