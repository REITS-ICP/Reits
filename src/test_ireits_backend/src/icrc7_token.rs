use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::api::time;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

// Core Token Types
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub description: Option<String>,
    pub logo: Option<Vec<u8>>,
    pub content_type: Option<String>,
    pub decimals: u8,
    pub website: Option<String>,
    pub social_links: Option<Vec<String>>,
    pub supply_cap: Option<u64>,
    pub image: Option<Vec<u8>>,
    pub royalties: Option<u16>,
    pub royalty_recipient: Option<Principal>,
    pub tags: Option<Vec<String>>,
    pub created_at: u64,
    pub modified_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Token {
    pub token_id: u64,
    pub owner: Principal,
    pub metadata: TokenMetadata,
    pub transfer_restricted: bool,
    pub last_transfer: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Collection {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub total_supply: u64,
    pub max_supply: Option<u64>,
    pub royalties: u16,
    pub owner: Principal,
    pub treasury: Principal,
    pub created_at: u64,
    pub logo: Option<Vec<u8>>,
    pub website: Option<String>,
    pub social_links: Option<Vec<String>>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenStats {
    pub total_transactions: u64,
    pub unique_holders: u64,
    pub market_cap: u64,
    pub volume_24h: u64,
    pub price_change_24h: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferArgs {
    pub spender_subaccount: Option<Vec<u8>>,
    pub from: Principal,
    pub to: Principal,
    pub token_id: u64,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ApprovalArgs {
    pub from_subaccount: Option<Vec<u8>>,
    pub spender: Principal,
    pub token_id: u64,
    pub expires_at: Option<u64>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

// State Management
thread_local! {
    static COLLECTION: RefCell<Option<Collection>> = RefCell::new(None);
    static TOKENS: RefCell<HashMap<u64, Token>> = RefCell::new(HashMap::new());
    static TOKEN_OWNERS: RefCell<HashMap<Principal, HashSet<u64>>> = RefCell::new(HashMap::new());
    static APPROVALS: RefCell<HashMap<(Principal, u64), (Principal, Option<u64>)>> = RefCell::new(HashMap::new());
    static TOKEN_COUNTER: RefCell<u64> = RefCell::new(0);
    static TOKEN_STATS: RefCell<HashMap<u64, TokenStats>> = RefCell::new(HashMap::new());
}

// ICRC-7 Implementation
pub struct ICRC7Token;

impl ICRC7Token {
    // Collection Management
    pub fn initialize_collection(
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
                max_supply,
                royalties,
                owner: caller,
                treasury,
                created_at: time(),
                logo,
                website,
                social_links,
            });
            
            true
        })
    }

    // Token Queries
    pub fn name() -> String {
        COLLECTION.with(|c| {
            c.borrow()
                .as_ref()
                .map(|c| c.name.clone())
                .unwrap_or_else(|| "".to_string())
        })
    }

    pub fn symbol() -> String {
        COLLECTION.with(|c| {
            c.borrow()
                .as_ref()
                .map(|c| c.symbol.clone())
                .unwrap_or_else(|| "".to_string())
        })
    }

    pub fn total_supply() -> u64 {
        COLLECTION.with(|c| c.borrow().as_ref().map(|c| c.total_supply).unwrap_or(0))
    }

    pub fn max_supply() -> Option<u64> {
        COLLECTION.with(|c| c.borrow().as_ref().and_then(|c| c.max_supply))
    }

    pub fn owner_of(token_id: u64) -> Option<Principal> {
        TOKENS.with(|tokens| tokens.borrow().get(&token_id).map(|t| t.owner))
    }

    pub fn balance_of(owner: Principal) -> u64 {
        TOKEN_OWNERS.with(|owners| {
            owners
                .borrow()
                .get(&owner)
                .map(|tokens| tokens.len() as u64)
                .unwrap_or(0)
        })
    }

    // Token Operations
    pub fn mint(
        owner: Principal,
        metadata: TokenMetadata,
        transfer_restricted: bool,
    ) -> Option<u64> {
        // Check collection and max supply first
        let collection = COLLECTION.with(|c| c.borrow().clone())?;
        if let Some(max_supply) = collection.max_supply {
            if collection.total_supply >= max_supply {
                return None;
            }
        }
        
        // Generate token ID
        let token_id = TOKEN_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            *counter += 1;
            *counter
        });
        
        let token = Token {
            token_id,
            owner,
            metadata: TokenMetadata {
                created_at: time(),
                modified_at: time(),
                ..metadata
            },
            transfer_restricted,
            last_transfer: None,
        };

        // Initialize token stats
        TOKEN_STATS.with(|stats| {
            stats.borrow_mut().insert(token_id, TokenStats {
                total_transactions: 0,
                unique_holders: 1,
                market_cap: 0,
                volume_24h: 0,
                price_change_24h: 0.0,
            });
        });

        // Store token
        TOKENS.with(|tokens| {
            tokens.borrow_mut().insert(token_id, token.clone());
        });

        // Update owner records
        TOKEN_OWNERS.with(|owners| {
            owners
                .borrow_mut()
                .entry(owner)
                .or_insert_with(HashSet::new)
                .insert(token_id);
        });

        // Update collection total supply
        COLLECTION.with(|c| {
            if let Some(ref mut c) = *c.borrow_mut() {
                c.total_supply += 1;
            }
        });

        Some(token_id)
    }

    pub fn transfer(args: TransferArgs) -> Result<bool, String> {
        let caller = ic_caller();
        
        // Verify ownership or approval
        if args.from != caller {
            let is_approved = APPROVALS.with(|approvals| {
                approvals
                    .borrow()
                    .get(&(args.from, args.token_id))
                    .map(|(approved_spender, expires_at)| {
                        caller == *approved_spender
                            && expires_at
                                .map(|exp| exp > time())
                                .unwrap_or(true)
                    })
                    .unwrap_or(false)
            });

            if !is_approved {
                return Err("Not authorized to transfer".to_string());
            }
        }

        // Update token ownership and stats
        TOKENS.with(|tokens| {
            let mut tokens = tokens.borrow_mut();
            if let Some(token) = tokens.get_mut(&args.token_id) {
                if token.owner != args.from {
                    return Err("Token not owned by sender".to_string());
                }
                if token.transfer_restricted {
                    return Err("Token transfers are restricted".to_string());
                }
                token.owner = args.to;
                token.last_transfer = Some(time());
                
                // Update token stats
                TOKEN_STATS.with(|stats| {
                    if let Some(token_stats) = stats.borrow_mut().get_mut(&args.token_id) {
                        token_stats.total_transactions += 1;
                    }
                });
                
                Ok(())
            } else {
                Err("Token not found".to_string())
            }
        })?;

        // Update owner records
        TOKEN_OWNERS.with(|owners| {
            let mut owners = owners.borrow_mut();
            
            // Remove from previous owner
            if let Some(owned_tokens) = owners.get_mut(&args.from) {
                owned_tokens.remove(&args.token_id);
            }
            
            // Add to new owner
            owners
                .entry(args.to)
                .or_insert_with(HashSet::new)
                .insert(args.token_id);
        });

        // Clear approval if exists
        APPROVALS.with(|approvals| {
            approvals.borrow_mut().remove(&(args.from, args.token_id));
        });

        Ok(true)
    }

    pub fn approve(args: ApprovalArgs) -> Result<bool, String> {
        let caller = ic_caller();
        
        // Verify ownership
        let owns_token = TOKENS.with(|tokens| {
            tokens
                .borrow()
                .get(&args.token_id)
                .map(|t| t.owner == caller)
                .unwrap_or(false)
        });

        if !owns_token {
            return Err("Not token owner".to_string());
        }

        // Set approval
        APPROVALS.with(|approvals| {
            approvals
                .borrow_mut()
                .insert((caller, args.token_id), (args.spender, args.expires_at));
        });

        Ok(true)
    }

    // Queries
    pub fn get_approved(token_id: u64) -> Option<(Principal, Option<u64>)> {
        let owner = Self::owner_of(token_id)?;
        APPROVALS.with(|approvals| approvals.borrow().get(&(owner, token_id)).cloned())
    }

    pub fn get_metadata(token_id: u64) -> Option<TokenMetadata> {
        TOKENS.with(|tokens| tokens.borrow().get(&token_id).map(|t| t.metadata.clone()))
    }

    pub fn get_token(token_id: u64) -> Option<Token> {
        TOKENS.with(|tokens| tokens.borrow().get(&token_id).cloned())
    }

    pub fn get_collection_info() -> Option<Collection> {
        COLLECTION.with(|c| c.borrow().clone())
    }

    pub fn get_token_stats(token_id: u64) -> Option<TokenStats> {
        TOKEN_STATS.with(|stats| stats.borrow().get(&token_id).cloned())
    }

    pub fn get_user_tokens(user: Principal) -> Vec<Token> {
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
} 