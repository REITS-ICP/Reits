# RWA - Real World Asset Tokenization Platform

A decentralized platform for tokenizing real estate and other real-world assets on the Internet Computer blockchain.

## Overview

RWA is a comprehensive platform that enables the tokenization of real-world assets, particularly real estate, into tradeable digital tokens. The platform implements the ICRC-7 token standard and provides a full suite of features for property management, token creation, trading, and rental income distribution.

## Features

### Property Management
- List and manage real estate properties
- Upload and verify property documents (deeds, titles, inspections)
- Track property status and ownership
- Manage rental income and distributions

### Token System (ICRC-7 Standard)
- Create property-backed tokens with detailed metadata
- Configure token supply, pricing, and trading parameters
- Support for royalties and transfer restrictions
- Track token statistics and market metrics

### Trading Features
- Buy and sell property tokens
- Transfer tokens between users
- Approve and delegate token operations
- Track transaction history

### Payment System
- Support for both USDC and USDT stablecoins
- Automated rental income distribution
- Royalty payments handling
- Secure payment processing

## Technical Architecture

### Backend Canisters
1. `test_ireits_backend`: Main canister handling property and token logic
2. `mock_usdc`: Mock USDC ledger for testing
3. `mock_usdt`: Mock USDT ledger for testing
4. `internet-identity`: Authentication canister

### Token Implementation
The platform implements the ICRC-7 token standard with enhanced features:
- Full metadata support (name, symbol, decimals, etc.)
- Market statistics tracking
- Supply management
- Transfer restrictions
- Royalty system

### Smart Contract Features
- Automated rental income distribution
- Configurable token parameters
- Property-token linking
- Document verification

## Getting Started

### Prerequisites
- dfx (Internet Computer SDK)
- Node.js and npm
- Rust toolchain

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/REITS-ICP/Reits.git
   cd Reits
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Internet Computer replica:
   ```bash
   dfx start --background --clean 
   ```

4. Deploy the canisters:
   ```bash
   dfx deploy
   ```

### Configuration

1. Initialize the collection:
   ```bash
   dfx canister call test_ireits_backend initialize_collection '(
     "RWA Collection",
     "RWAC",
     "Real World Asset Collection",
     250: nat16,
     principal "your-treasury-principal",
     opt (10000: nat64),
     null,
     opt "https://rwa.com",
     opt vec { "https://twitter.com/rwa"; "https://discord.gg/rwa" }
   )'
   ```

2. Configure payment managers:
   ```bash
   dfx canister call test_ireits_backend initialize_payment_manager "(principal \"$(dfx canister id mock_usdc)\", principal \"$(dfx canister id mock_usdt)\")"
   ```

## Usage Examples

### List a Property
```bash
dfx canister call test_ireits_backend list_property '(
  1000.0: float64,
  "123 Main St",
  "Beautiful 3 bed house",
  null
)'
```

### Tokenize a Property
```bash
dfx canister call test_ireits_backend tokenize_property '(
  1: nat64,
  "RWA Token",
  "RWA",
  opt "Real World Asset Token",
  1000: nat64,
  10: nat64,
  opt 250
)'
```

### Purchase Tokens
```bash
dfx canister call test_ireits_backend purchase_tokens '(1: nat64, 100: nat64)'
```

### Transfer Tokens
```bash
dfx canister call test_ireits_backend transfer '(
  record {
    spender_subaccount = null;
    from = principal "sender-principal";
    to = principal "receiver-principal";
    token_id = 1;
    memo = null;
    created_at_time = null
  }
)'
```

## API Documentation

### Property Management
- `list_property`: Create a new property listing
- `get_property`: Retrieve property details
- `add_document`: Add property documents
- `get_all_properties`: List all properties

### Token Management
- `name`: Get token collection name
- `symbol`: Get token symbol
- `total_supply`: Get total token supply
- `owner_of`: Get token owner
- `balance_of`: Get user's token balance
- `transfer`: Transfer tokens
- `approve`: Approve token delegation
- `get_metadata`: Get token metadata
- `get_token_stats`: Get token statistics

### Transaction Management
- `initiate_transaction`: Start a property transaction
- `complete_transaction`: Complete a property transaction
- `get_transaction`: Get transaction details

### Income Distribution
- `distribute_token_income`: Distribute rental income to token holders

## Security

The platform implements several security measures:
- Principal-based authentication
- Transfer restrictions
- Approval system for delegated operations
- Secure payment processing
- Document verification