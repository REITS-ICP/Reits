use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum TokenType {
    RET,
    ICP,
} 