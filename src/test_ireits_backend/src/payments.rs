use candid::{CandidType, Deserialize, Principal};
use std::cell::RefCell;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PaymentError {
    InsufficientBalance,
    TransferFailed,
    InvalidToken,
}

pub struct PaymentManager {
    usdc_ledger: Principal,
    usdt_ledger: Principal,
}

thread_local! {
    static PAYMENT_MANAGER: RefCell<Option<PaymentManager>> = RefCell::new(None);
}

impl PaymentManager {
    pub fn new(usdc_ledger: Principal, usdt_ledger: Principal) -> Self {
        PaymentManager {
            usdc_ledger,
            usdt_ledger,
        }
    }
}

pub fn initialize_payment_manager(usdc_ledger: Principal, usdt_ledger: Principal) {
    PAYMENT_MANAGER.with(|manager| {
        *manager.borrow_mut() = Some(PaymentManager::new(usdc_ledger, usdt_ledger));
    });
} 