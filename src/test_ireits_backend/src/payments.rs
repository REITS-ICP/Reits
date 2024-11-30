use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult;
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PaymentError {
    pub kind: PaymentErrorKind,
    pub message: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum PaymentErrorKind {
    InsufficientBalance,
    TransferFailed,
    Other,
}

#[derive(Clone)]
pub struct PaymentManager {
    pub usdc_ledger: Principal,
    pub usdt_ledger: Principal,
}

impl PaymentManager {
    pub fn new(usdc_ledger: Principal, usdt_ledger: Principal) -> Self {
        Self {
            usdc_ledger,
            usdt_ledger,
        }
    }

    pub async fn process_payment(
        &self,
        from: Principal,
        to: Principal,
        amount: u64,
        use_usdt: bool,
    ) -> Result<(), PaymentError> {
        let ledger = if use_usdt {
            self.usdt_ledger
        } else {
            self.usdc_ledger
        };

        let result: CallResult<(bool,)> = ic_cdk::call(ledger, "icrc1_transfer", (from, to, amount)).await;
        match result {
            Ok((true,)) => Ok(()),
            Ok((false,)) => Err(PaymentError {
                kind: PaymentErrorKind::TransferFailed,
                message: "Transfer rejected by token canister".to_string(),
            }),
            Err((code, msg)) => Err(PaymentError {
                kind: PaymentErrorKind::TransferFailed,
                message: format!("Error code: {:?}, message: {}", code, msg),
            }),
        }
    }

    pub async fn distribute_income(
        &self,
        from: Principal,
        distributions: Vec<(Principal, u64)>,
        use_usdt: bool,
    ) -> Result<(), PaymentError> {
        let ledger = if use_usdt {
            self.usdt_ledger
        } else {
            self.usdc_ledger
        };

        for (recipient, amount) in distributions {
            let result: CallResult<(bool,)> = ic_cdk::call(ledger, "icrc1_transfer", (from, recipient, amount)).await;
            match result {
                Ok((true,)) => continue,
                Ok((false,)) => return Err(PaymentError {
                    kind: PaymentErrorKind::TransferFailed,
                    message: "Transfer rejected by token canister".to_string(),
                }),
                Err((code, msg)) => return Err(PaymentError {
                    kind: PaymentErrorKind::TransferFailed,
                    message: format!("Error code: {:?}, message: {}", code, msg),
                }),
            }
        }
        Ok(())
    }
} 