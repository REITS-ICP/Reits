use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static BALANCES: RefCell<HashMap<Principal, u64>> = RefCell::new(HashMap::new());
}

#[update]
fn icrc1_transfer(from: Principal, to: Principal, amount: u64) -> bool {
    BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        let from_balance = balances.entry(from).or_insert(1_000_000); // Give initial balance for testing
        
        if *from_balance < amount {
            return false;
        }
        
        *from_balance -= amount;
        *balances.entry(to).or_insert(0) += amount;
        
        true
    })
}

#[query]
fn icrc1_balance_of(account: Principal) -> u64 {
    BALANCES.with(|balances| {
        *balances.borrow().get(&account).unwrap_or(&0)
    })
} 