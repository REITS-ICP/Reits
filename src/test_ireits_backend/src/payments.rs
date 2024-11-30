use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult;
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TokenInterface {
    pub canister_id: Principal,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TransferArgs {
    pub to: Principal,
    pub amount: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PaymentError {
    pub kind: PaymentErrorKind,
    pub message: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum PaymentErrorKind {
    InsufficientBalance,
    TransferFailed,
    InvalidToken,
}

impl TokenInterface {
    pub fn new(canister_id: Principal) -> Self {
        Self { canister_id }
    }

    pub async fn transfer(&self, to: Principal, amount: u64) -> Result<(), PaymentError> {
        let args = TransferArgs { to, amount };
        
        let result: CallResult<(bool,)> = ic_cdk::call(
            self.canister_id,
            "icrc1_transfer",
            (args,)
        ).await;

        match result {
            Ok((true,)) => Ok(()),
            Ok((false,)) => Err(PaymentError {
                kind: PaymentErrorKind::TransferFailed,
                message: "Transfer rejected by token canister".to_string(),
            }),
            Err((code, msg)) => Err(PaymentError {
                kind: PaymentErrorKind::TransferFailed,
                message: format!("Error code: {}, message: {}", code, msg),
            }),
        }
    }

    pub async fn balance_of(&self, account: Principal) -> Result<u64, PaymentError> {
        let result: CallResult<(u64,)> = ic_cdk::call(
            self.canister_id,
            "icrc1_balance_of",
            (account,)
        ).await;

        match result {
            Ok((balance,)) => Ok(balance),
            Err((code, msg)) => Err(PaymentError {
                kind: PaymentErrorKind::TransferFailed,
                message: format!("Error code: {}, message: {}", code, msg),
            }),
        }
    }
}

pub struct PaymentManager {
    ckusdc: TokenInterface,
    ckusdt: TokenInterface,
}

impl PaymentManager {
    pub fn new(ckusdc_id: Principal, ckusdt_id: Principal) -> Self {
        Self {
            ckusdc: TokenInterface::new(ckusdc_id),
            ckusdt: TokenInterface::new(ckusdt_id),
        }
    }

    pub async fn process_payment(
        &self,
        from: Principal,
        to: Principal,
        amount: u64,
        use_usdt: bool,
    ) -> Result<(), PaymentError> {
        let token = if use_usdt { &self.ckusdt } else { &self.ckusdc };
        
        // Check balance
        let balance = token.balance_of(from).await?;
        if balance < amount {
            return Err(PaymentError {
                kind: PaymentErrorKind::InsufficientBalance,
                message: "Insufficient balance for payment".to_string(),
            });
        }

        // Process transfer
        token.transfer(to, amount).await
    }

    pub async fn distribute_income(
        &self,
        from: Principal,
        distributions: Vec<(Principal, u64)>,
        use_usdt: bool,
    ) -> Result<(), PaymentError> {
        let token = if use_usdt { &self.ckusdt } else { &self.ckusdc };
        
        // Calculate total amount needed
        let total_amount: u64 = distributions.iter().map(|(_, amount)| amount).sum();
        
        // Check if enough balance
        let balance = token.balance_of(from).await?;
        if balance < total_amount {
            return Err(PaymentError {
                kind: PaymentErrorKind::InsufficientBalance,
                message: "Insufficient balance for distributions".to_string(),
            });
        }

        // Process all distributions
        for (recipient, amount) in distributions {
            token.transfer(recipient, amount).await?;
        }

        Ok(())
    }
} 