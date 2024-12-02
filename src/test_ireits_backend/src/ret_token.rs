use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::api::time;
use std::cell::RefCell;
use std::collections::HashMap;

const INITIAL_SUPPLY: u64 = 10_000_000;
const MAX_SUPPLY: u64 = 20_000_000;
const AIRDROP_ALLOCATION: u64 = INITIAL_SUPPLY / 2; // 50% for testing
const MIN_STAKE_DURATION: u64 = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
const STAKE_APR: u64 = 10; // 10% APR for staking

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub description: Option<String>,
    pub logo: Option<Vec<u8>>,
    pub decimals: u8,
    pub total_supply: u64,
    pub circulating_supply: u64,
    pub owner: Principal,
    pub created_at: u64,
    pub website: Option<String>,
    pub social_links: Option<Vec<String>>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenHolder {
    pub balance: u64,
    pub allowances: HashMap<Principal, u64>,
    pub staked_balance: u64,
    pub last_stake_time: Option<u64>,
    pub stake_duration: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenStats {
    pub total_transactions: u64,
    pub unique_holders: u64,
    pub market_cap: u64,
    pub volume_24h: u64,
    pub price_change_24h: f64,
    pub total_staked: u64,
    pub total_airdropped: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferArgs {
    pub from: Principal,
    pub to: Principal,
    pub amount: u64,
    pub memo: Option<Vec<u8>>,
}

thread_local! {
    static METADATA: RefCell<Option<TokenMetadata>> = RefCell::new(None);
    static BALANCES: RefCell<HashMap<Principal, TokenHolder>> = RefCell::new(HashMap::new());
    static STATS: RefCell<TokenStats> = RefCell::new(TokenStats {
        total_transactions: 0,
        unique_holders: 0,
        market_cap: 0,
        volume_24h: 0,
        price_change_24h: 0.0,
        total_staked: 0,
        total_airdropped: 0,
    });
}

pub struct RETToken;

impl RETToken {
    pub fn initialize(owner: Principal, website: Option<String>, social_links: Option<Vec<String>>) -> bool {
        METADATA.with(|metadata| {
            if metadata.borrow().is_some() {
                return false;
            }

            *metadata.borrow_mut() = Some(TokenMetadata {
                name: "Real Estate Token".to_string(),
                symbol: "RET".to_string(),
                description: Some("Governance token for Real Estate Investment Platform".to_string()),
                logo: None,
                decimals: 8,
                total_supply: INITIAL_SUPPLY,
                circulating_supply: INITIAL_SUPPLY - AIRDROP_ALLOCATION,
                owner,
                created_at: time(),
                website,
                social_links,
            });

            // Initialize owner balance
            BALANCES.with(|balances| {
                balances.borrow_mut().insert(owner, TokenHolder {
                    balance: INITIAL_SUPPLY - AIRDROP_ALLOCATION,
                    allowances: HashMap::new(),
                    staked_balance: 0,
                    last_stake_time: None,
                    stake_duration: None,
                });
            });

            true
        })
    }

    pub fn transfer(args: TransferArgs) -> Result<bool, String> {
        let caller = ic_caller();
        
        if args.from != caller {
            return Err("Not authorized".to_string());
        }

        BALANCES.with(|balances| {
            let mut balances = balances.borrow_mut();
            let from_holder = balances.get(&args.from)
                .ok_or_else(|| "Sender has no balance".to_string())?;
            
            if from_holder.balance < args.amount {
                return Err("Insufficient balance".to_string());
            }

            // Update sender balance
            let mut new_from_holder = from_holder.clone();
            new_from_holder.balance -= args.amount;
            balances.insert(args.from, new_from_holder);
            
            // Update recipient balance
            let mut to_holder = balances.get(&args.to)
                .cloned()
                .unwrap_or_else(|| TokenHolder {
                    balance: 0,
                    allowances: HashMap::new(),
                    staked_balance: 0,
                    last_stake_time: None,
                    stake_duration: None,
                });
            
            to_holder.balance += args.amount;
            balances.insert(args.to, to_holder);
            
            // Update stats
            STATS.with(|stats| {
                let mut stats = stats.borrow_mut();
                stats.total_transactions += 1;
                stats.volume_24h += args.amount;
            });

            Ok(true)
        })
    }

    pub fn stake(amount: u64, duration: u64) -> Result<bool, String> {
        let caller = ic_caller();
        
        if duration < MIN_STAKE_DURATION {
            return Err("Minimum staking duration is 30 days".to_string());
        }

        BALANCES.with(|balances| {
            let mut balances = balances.borrow_mut();
            let holder = balances.get_mut(&caller)
                .ok_or("No balance found")?;

            if holder.balance < amount {
                return Err("Insufficient balance".to_string());
            }

            holder.balance -= amount;
            holder.staked_balance += amount;
            holder.last_stake_time = Some(time());
            holder.stake_duration = Some(duration);

            STATS.with(|stats| {
                let mut stats = stats.borrow_mut();
                stats.total_staked += amount;
            });

            Ok(true)
        })
    }

    pub fn unstake() -> Result<u64, String> {
        let caller = ic_caller();
        
        BALANCES.with(|balances| {
            let mut balances = balances.borrow_mut();
            let holder = balances.get_mut(&caller)
                .ok_or("No balance found")?;

            if holder.staked_balance == 0 {
                return Err("No staked balance".to_string());
            }

            let stake_time = holder.last_stake_time
                .ok_or("No stake timestamp found")?;
            let duration = holder.stake_duration
                .ok_or("No stake duration found")?;

            let current_time = time();
            if current_time < stake_time + duration {
                return Err("Stake duration not met".to_string());
            }

            // Calculate rewards
            let stake_duration_days = (duration / (24 * 60 * 60 * 1_000_000_000)) as u64;
            let reward = (holder.staked_balance * STAKE_APR * stake_duration_days) / (365 * 100);

            // Return staked amount plus rewards
            let total_return = holder.staked_balance + reward;
            holder.balance += total_return;
            holder.staked_balance = 0;
            holder.last_stake_time = None;
            holder.stake_duration = None;

            STATS.with(|stats| {
                let mut stats = stats.borrow_mut();
                stats.total_staked -= holder.staked_balance;
            });

            Ok(total_return)
        })
    }

    pub fn airdrop(recipients: Vec<(Principal, u64)>) -> Result<bool, String> {
        let total_amount: u64 = recipients.iter().map(|(_, amount)| amount).sum();
        
        STATS.with(|stats| {
            let mut stats = stats.borrow_mut();
            if stats.total_airdropped + total_amount > AIRDROP_ALLOCATION {
                return Err("Exceeds airdrop allocation".to_string());
            }
            stats.total_airdropped += total_amount;
            
            for (recipient, amount) in recipients {
                BALANCES.with(|balances| {
                    let mut balances = balances.borrow_mut();
                    let holder = balances.entry(recipient).or_insert(TokenHolder {
                        balance: 0,
                        allowances: HashMap::new(),
                        staked_balance: 0,
                        last_stake_time: None,
                        stake_duration: None,
                    });
                    holder.balance += amount;
                });
            }
            Ok(true)
        })
    }

    pub fn balance_of(owner: Principal) -> u64 {
        BALANCES.with(|balances| {
            balances.borrow()
                .get(&owner)
                .map(|holder| holder.balance)
                .unwrap_or(0)
        })
    }

    pub fn staked_balance_of(owner: Principal) -> u64 {
        BALANCES.with(|balances| {
            balances.borrow()
                .get(&owner)
                .map(|holder| holder.staked_balance)
                .unwrap_or(0)
        })
    }

    pub fn get_metadata() -> Option<TokenMetadata> {
        METADATA.with(|metadata| metadata.borrow().clone())
    }

    pub fn get_stats() -> TokenStats {
        STATS.with(|stats| stats.borrow().clone())
    }
} 