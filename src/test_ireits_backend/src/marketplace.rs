use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::api::time;
use std::cell::RefCell;
use std::collections::HashMap;

use crate::icrc7_token::{ICRC7Token, Token};
use crate::ret_token::RETToken;

const LISTING_FEE_PERCENTAGE: u64 = 100; // 1% = 100 basis points

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ListingPrice {
    pub amount: u64,
    pub token_type: TokenType,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TokenType {
    RET,
    ICP,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PropertyShare {
    pub owner: Principal,
    pub share_percentage: u16, // Basis points (e.g., 10000 = 100%)
    pub last_distribution: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Listing {
    pub id: u64,
    pub property_token_id: u64,
    pub seller: Principal,
    pub price: ListingPrice,
    pub created_at: u64,
    pub status: ListingStatus,
    pub highest_bid: Option<Bid>,
    pub royalty_percentage: u16,
    pub listing_fee: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Bid {
    pub bidder: Principal,
    pub amount: u64,
    pub token_type: TokenType,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MarketplaceStats {
    pub total_listings: u64,
    pub active_listings: u64,
    pub total_sales: u64,
    pub total_volume_ret: u64,
    pub total_volume_icp: u64,
    pub total_listing_fees: u64,
}

thread_local! {
    static LISTINGS: RefCell<HashMap<u64, Listing>> = RefCell::new(HashMap::new());
    static PROPERTY_SHARES: RefCell<HashMap<u64, Vec<PropertyShare>>> = RefCell::new(HashMap::new());
    static LISTING_COUNTER: RefCell<u64> = RefCell::new(0);
    static MARKETPLACE_STATS: RefCell<MarketplaceStats> = RefCell::new(MarketplaceStats {
        total_listings: 0,
        active_listings: 0,
        total_sales: 0,
        total_volume_ret: 0,
        total_volume_icp: 0,
        total_listing_fees: 0,
    });
}

pub struct Marketplace;

impl Marketplace {
    pub fn list_property(
        property_token_id: u64,
        price: ListingPrice,
        royalty_percentage: u16,
    ) -> Result<u64, String> {
        let caller = ic_caller();
        
        // Calculate listing fee
        let listing_fee = (price.amount * LISTING_FEE_PERCENTAGE) / 10000;
        
        // Verify ownership
        if !Self::verify_ownership(property_token_id, caller)? {
            return Err("Not the property owner".to_string());
        }
        
        // Create listing
        let listing_id = LISTING_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            *counter += 1;
            *counter
        });
        
        let listing = Listing {
            id: listing_id,
            property_token_id,
            seller: caller,
            price,
            created_at: time(),
            status: ListingStatus::Active,
            highest_bid: None,
            royalty_percentage,
            listing_fee,
        };
        
        // Store listing
        LISTINGS.with(|listings| {
            listings.borrow_mut().insert(listing_id, listing);
        });
        
        // Update stats
        MARKETPLACE_STATS.with(|stats| {
            let mut stats = stats.borrow_mut();
            stats.total_listings += 1;
            stats.active_listings += 1;
            stats.total_listing_fees += listing_fee;
        });
        
        Ok(listing_id)
    }

    pub fn fractionalize_property(
        property_token_id: u64,
        shares: Vec<(Principal, u16)>,
    ) -> Result<(), String> {
        let caller = ic_caller();
        
        // Verify caller owns the property
        if !ICRC7Token::owner_of(property_token_id)
            .map(|owner| owner == caller)
            .unwrap_or(false) {
            return Err("Not the property owner".to_string());
        }
        
        // Verify total shares add up to 100%
        let total_shares: u16 = shares.iter().map(|(_, share)| share).sum();
        if total_shares != 10000 {
            return Err("Total shares must equal 100% (10000 basis points)".to_string());
        }
        
        // Create property shares
        let property_shares: Vec<PropertyShare> = shares
            .into_iter()
            .map(|(owner, share_percentage)| PropertyShare {
                owner,
                share_percentage,
                last_distribution: time(),
            })
            .collect();
        
        // Store shares
        PROPERTY_SHARES.with(|shares| {
            shares.borrow_mut().insert(property_token_id, property_shares);
        });
        
        Ok(())
    }

    pub fn distribute_ret_rewards(property_token_id: u64, amount: u64) -> Result<(), String> {
        PROPERTY_SHARES.with(|shares| {
            let shares = shares.borrow();
            let property_shares = shares.get(&property_token_id)
                .ok_or("Property not found")?;
            
            for share in property_shares {
                let reward = (amount * share.share_percentage as u64) / 10000;
                // Transfer RET tokens to share owner
                RETToken::transfer(TransferArgs {
                    from: ic_caller(),
                    to: share.owner,
                    amount: reward,
                    memo: None,
                })?;
            }
            
            Ok(())
        })
    }

    fn verify_ownership(property_token_id: u64, caller: Principal) -> Result<bool, String> {
        // Check direct ownership
        if let Some(owner) = ICRC7Token::owner_of(property_token_id) {
            if owner == caller {
                return Ok(true);
            }
        }
        
        // Check fractional ownership
        PROPERTY_SHARES.with(|shares| {
            let shares = shares.borrow();
            if let Some(property_shares) = shares.get(&property_token_id) {
                Ok(property_shares.iter().any(|share| share.owner == caller))
            } else {
                Ok(false)
            }
        })
    }

    pub fn place_bid(listing_id: u64, amount: u64, token_type: TokenType) -> Result<bool, String> {
        let caller = ic_caller();
        
        LISTINGS.with(|listings| {
            let mut listings = listings.borrow_mut();
            let listing = listings.get_mut(&listing_id)
                .ok_or_else(|| "Listing not found".to_string())?;
            
            if !matches!(listing.status, ListingStatus::Active) {
                return Err("Listing is not active".to_string());
            }
            
            if token_type != listing.price.token_type {
                return Err("Invalid token type for bid".to_string());
            }
            
            if let Some(ref highest_bid) = listing.highest_bid {
                if amount <= highest_bid.amount {
                    return Err("Bid amount must be higher than current highest bid".to_string());
                }
            } else if amount < listing.price.amount {
                return Err("Bid amount must be at least the listing price".to_string());
            }
            
            // Verify bidder has sufficient balance
            match token_type {
                TokenType::RET => {
                    let balance = RETToken::balance_of(caller);
                    if balance < amount {
                        return Err("Insufficient RET balance".to_string());
                    }
                },
                _ => {
                    // Implement other token balance checks
                    return Err("Other token types not implemented yet".to_string());
                }
            }
            
            // Update highest bid
            listing.highest_bid = Some(Bid {
                bidder: caller,
                amount,
                token_type,
                timestamp: time(),
            });
            
            Ok(true)
        })
    }

    pub fn accept_bid(listing_id: u64) -> Result<bool, String> {
        let caller = ic_caller();
        
        LISTINGS.with(|listings| {
            let mut listings = listings.borrow_mut();
            let listing = listings.get_mut(&listing_id)
                .ok_or_else(|| "Listing not found".to_string())?;
            
            if listing.seller != caller {
                return Err("Not the seller".to_string());
            }
            
            if !matches!(listing.status, ListingStatus::Active) {
                return Err("Listing is not active".to_string());
            }
            
            let bid = listing.highest_bid.as_ref()
                .ok_or_else(|| "No bids to accept".to_string())?;
            
            // Transfer property token
            ICRC7Token::transfer(crate::icrc7_token::TransferArgs {
                spender_subaccount: None,
                from: caller,
                to: bid.bidder,
                token_id: listing.property_token_id,
                memo: None,
                created_at_time: None,
            })?;
            
            // Transfer payment
            match bid.token_type {
                TokenType::RET => {
                    // Calculate royalty
                    let royalty_amount = (bid.amount * listing.royalty_percentage as u64) / 10000;
                    let seller_amount = bid.amount - royalty_amount;
                    
                    // Transfer to seller
                    RETToken::transfer(crate::ret_token::TransferArgs {
                        from: bid.bidder,
                        to: caller,
                        amount: seller_amount,
                        memo: None,
                    })?;
                    
                    // Transfer royalty to treasury
                    if royalty_amount > 0 {
                        if let Some(metadata) = RETToken::get_metadata() {
                            RETToken::transfer(crate::ret_token::TransferArgs {
                                from: bid.bidder,
                                to: metadata.owner, // Treasury
                                amount: royalty_amount,
                                memo: None,
                            })?;
                        }
                    }
                },
                _ => {
                    return Err("Other token types not implemented yet".to_string());
                }
            }
            
            // Update listing status
            listing.status = ListingStatus::Sold;
            
            // Update stats
            MARKETPLACE_STATS.with(|stats| {
                let mut stats = stats.borrow_mut();
                stats.active_listings -= 1;
                stats.total_sales += 1;
                match bid.token_type {
                    TokenType::RET => stats.total_volume_ret += bid.amount,
                    TokenType::ICP => stats.total_volume_icp += bid.amount,
                }
            });
            
            Ok(true)
        })
    }

    pub fn cancel_listing(listing_id: u64) -> Result<bool, String> {
        let caller = ic_caller();
        
        LISTINGS.with(|listings| {
            let mut listings = listings.borrow_mut();
            let listing = listings.get_mut(&listing_id)
                .ok_or_else(|| "Listing not found".to_string())?;
            
            if listing.seller != caller {
                return Err("Not the seller".to_string());
            }
            
            if !matches!(listing.status, ListingStatus::Active) {
                return Err("Listing is not active".to_string());
            }
            
            listing.status = ListingStatus::Cancelled;
            
            // Update stats
            MARKETPLACE_STATS.with(|stats| {
                let mut stats = stats.borrow_mut();
                stats.active_listings -= 1;
            });
            
            Ok(true)
        })
    }

    // Queries
    pub fn get_listing(listing_id: u64) -> Option<Listing> {
        LISTINGS.with(|listings| listings.borrow().get(&listing_id).cloned())
    }

    pub fn get_active_listings() -> Vec<Listing> {
        LISTINGS.with(|listings| {
            listings.borrow()
                .values()
                .filter(|l| matches!(l.status, ListingStatus::Active))
                .cloned()
                .collect()
        })
    }

    pub fn get_user_listings(user: Principal) -> Vec<Listing> {
        LISTINGS.with(|listings| {
            listings.borrow()
                .values()
                .filter(|l| l.seller == user)
                .cloned()
                .collect()
        })
    }

    pub fn get_user_bids(user: Principal) -> Vec<(u64, Bid)> {
        LISTINGS.with(|listings| {
            listings.borrow()
                .iter()
                .filter_map(|(id, listing)| {
                    listing.highest_bid.as_ref()
                        .filter(|bid| bid.bidder == user)
                        .map(|bid| (*id, bid.clone()))
                })
                .collect()
        })
    }

    pub fn get_stats() -> MarketplaceStats {
        MARKETPLACE_STATS.with(|stats| stats.borrow().clone())
    }
} 