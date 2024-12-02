#!/bin/bash

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ Success: $1"
    else
        echo "❌ Failed: $1"
        exit 1
    fi
}

# Function to check command with allowed failure
check_with_warning() {
    if [ $? -eq 0 ]; then
        echo "✅ Success: $1"
    else
        echo "⚠️  Warning: $1 (continuing...)"
    fi
}

# Start local replica if not running
dfx start --background --clean
check_success "Starting local replica"

# Deploy the canister
dfx deploy
check_success "Deploying canister"

# Store identity principal
PRINCIPAL=$(dfx identity get-principal)
echo "Using principal: $PRINCIPAL"

# Initialize RET token
echo -e "\n1. Initializing RET token..."
dfx canister call test_ireits_backend initialize_ret \
  "(principal \"$PRINCIPAL\", opt \"https://ireit.com\", null)"
check_success "RET token initialization"

# Verify initial supply and allocation
echo -e "\n2. Verifying token metadata..."
dfx canister call test_ireits_backend get_ret_metadata
check_success "Token metadata verification"

# Create test users
echo -e "\n3. Creating test users..."
dfx identity new --disable-encryption test_user1 || true
dfx identity new --disable-encryption test_user2 || true
check_success "Creating test users"

USER1_PRINCIPAL=$(dfx --identity test_user1 identity get-principal)
USER2_PRINCIPAL=$(dfx --identity test_user2 identity get-principal)

# Perform airdrop
echo -e "\n4. Performing airdrop..."
dfx canister call test_ireits_backend airdrop_ret \
  "(vec { 
    record { principal \"$USER1_PRINCIPAL\"; 100_000:nat64 };
    record { principal \"$USER2_PRINCIPAL\"; 50_000:nat64 }
  })"
check_success "RET airdrop"

# Verify balances after airdrop
echo -e "\n5. Verifying balances after airdrop..."
dfx canister call test_ireits_backend balance_of "(principal \"$USER1_PRINCIPAL\")"
check_success "User 1 balance verification"
dfx canister call test_ireits_backend balance_of "(principal \"$USER2_PRINCIPAL\")"
check_success "User 2 balance verification"

# Switch to test_user1 and stake tokens
echo -e "\n6. Staking tokens..."
dfx identity use test_user1
check_success "Switching to test_user1"
dfx canister call test_ireits_backend stake \
  "(50_000:nat64, 2_592_000_000_000_000:nat64)"
check_success "Token staking"

# Verify staked balance
echo -e "\n7. Verifying staked balance..."
dfx canister call test_ireits_backend staked_balance_of "(principal \"$USER1_PRINCIPAL\")"
check_success "Staked balance verification"

# Fast forward time (for testing)
echo -e "\n8. Simulating time passage..."
dfx canister call test_ireits_backend test_advance_time "(2_592_000_000_000_000:nat64)"
check_with_warning "Time simulation (skipped in non-test mode)"

# Unstake tokens
echo -e "\n9. Unstaking tokens..."
dfx canister call test_ireits_backend unstake
check_success "Token unstaking"

# Verify balance after unstaking
echo -e "\n10. Verifying balance after unstaking..."
dfx canister call test_ireits_backend balance_of "(principal \"$USER1_PRINCIPAL\")"
check_success "Post-unstaking balance verification"

# Transfer tokens between users
echo -e "\n11. Testing token transfer..."
dfx canister call test_ireits_backend transfer \
  "(record {
    from = principal \"$USER1_PRINCIPAL\";
    to = principal \"$USER2_PRINCIPAL\";
    amount = 10_000:nat64;
    memo = null
  })"
check_success "Token transfer"

# Verify balances after transfer
echo -e "\n12. Verifying balances after transfer..."
dfx canister call test_ireits_backend balance_of "(principal \"$USER1_PRINCIPAL\")"
check_success "User 1 post-transfer balance"
dfx canister call test_ireits_backend balance_of "(principal \"$USER2_PRINCIPAL\")"
check_success "User 2 post-transfer balance"

# Get token stats
echo -e "\n13. Getting token stats..."
dfx canister call test_ireits_backend get_ret_stats
check_success "Token stats retrieval"

# Switch back to default identity
dfx identity use default
check_success "Switching back to default identity"

echo -e "\n✅ RET Token test sequence completed successfully!" 