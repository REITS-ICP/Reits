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

# Create test users
echo -e "\n2. Creating test users..."
dfx identity new --disable-encryption property_owner || true
dfx identity new --disable-encryption investor1 || true
dfx identity new --disable-encryption investor2 || true
dfx identity new --disable-encryption investor3 || true
check_success "Creating test users"

OWNER_PRINCIPAL=$(dfx --identity property_owner identity get-principal)
INV1_PRINCIPAL=$(dfx --identity investor1 identity get-principal)
INV2_PRINCIPAL=$(dfx --identity investor2 identity get-principal)
INV3_PRINCIPAL=$(dfx --identity investor3 identity get-principal)

# Airdrop RET for testing
echo -e "\n3. Airdropping RET..."
dfx canister call test_ireits_backend airdrop_ret \
  "(vec { 
    record { principal \"$OWNER_PRINCIPAL\"; 1_000_000:nat64 };
    record { principal \"$PRINCIPAL\"; 1_000_000:nat64 }
  })"
check_success "RET airdrop"

# Switch to property owner
dfx identity use property_owner
check_success "Switching to property owner identity"

# List and tokenize property
echo -e "\n4. Creating property token..."
dfx canister call test_ireits_backend list_property \
  "(500000.0, \"456 Oak St\", \"Rental Property\", opt record { monthly_amount = 5000:nat64; last_distribution = 0:nat64; distribution_frequency = 2592000:nat64 })"
check_success "Property listing"

dfx canister call test_ireits_backend tokenize_property \
  "(1:nat64, \"Oak St Property\", \"OAK\", opt \"Rental Property with Monthly Income\", 10000:nat64, 50:nat64, opt (250:nat16))"
check_success "Property tokenization"

# Fractionalize property
echo -e "\n5. Fractionalizing property..."
dfx canister call test_ireits_backend fractionalize_property \
  "(1:nat64, vec {
    record { principal \"$INV1_PRINCIPAL\"; 4000:nat16 };
    record { principal \"$INV2_PRINCIPAL\"; 3000:nat16 };
    record { principal \"$INV3_PRINCIPAL\"; 3000:nat16 }
  })"
check_success "Property fractionalization"

# Simulate first month
echo -e "\n6. Testing first month distribution..."
dfx canister call test_ireits_backend test_advance_time "(2592000000000000:nat64)"
check_success "Time advancement for first month"
dfx canister call test_ireits_backend distribute_rental_income "(1:nat64)"
check_success "First month distribution"

# Verify distributions
echo -e "\n7. Verifying first distribution..."
dfx canister call test_ireits_backend balance_of "(principal \"$INV1_PRINCIPAL\")"
check_success "Investor 1 balance verification"
dfx canister call test_ireits_backend balance_of "(principal \"$INV2_PRINCIPAL\")"
check_success "Investor 2 balance verification"
dfx canister call test_ireits_backend balance_of "(principal \"$INV3_PRINCIPAL\")"
check_success "Investor 3 balance verification"

# Simulate second month
echo -e "\n8. Testing second month distribution..."
dfx canister call test_ireits_backend test_advance_time "(2592000000000000:nat64)"
check_success "Time advancement for second month"
dfx canister call test_ireits_backend distribute_rental_income "(1:nat64)"
check_success "Second month distribution"

# Verify cumulative distributions
echo -e "\n9. Verifying cumulative distributions..."
dfx canister call test_ireits_backend balance_of "(principal \"$INV1_PRINCIPAL\")"
check_success "Investor 1 cumulative balance"
dfx canister call test_ireits_backend balance_of "(principal \"$INV2_PRINCIPAL\")"
check_success "Investor 2 cumulative balance"
dfx canister call test_ireits_backend balance_of "(principal \"$INV3_PRINCIPAL\")"
check_success "Investor 3 cumulative balance"

# Get distribution history
echo -e "\n10. Getting distribution history..."
dfx canister call test_ireits_backend get_distribution_history "(1:nat64)"
check_success "Distribution history retrieval"

# Get property stats
echo -e "\n11. Getting property stats..."
dfx canister call test_ireits_backend get_property_stats "(1:nat64)"
check_success "Property stats retrieval"

# Switch back to default identity
dfx identity use default
check_success "Switching back to default identity"

echo -e "\n✅ Distribution test sequence completed successfully!" 