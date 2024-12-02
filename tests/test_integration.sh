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
echo -e "\n=== 1. RET Token Setup ==="
echo "1.1 Initializing RET token..."
dfx canister call test_ireits_backend initialize_ret \
  "(principal \"$PRINCIPAL\", opt \"https://ireit.com\", null)"
check_success "RET token initialization"

# Initialize ICRC7 collection
echo -e "\n=== 2. ICRC7 Token Setup ==="
echo "2.1 Initializing ICRC7 collection..."
dfx canister call test_ireits_backend initialize_collection \
  "(\"Real Estate Properties\", \"REP\", \"Tokenized Real Estate Properties\", 250:nat16, principal \"$PRINCIPAL\", null, null, opt \"https://ireit.com\", null)"
check_success "ICRC7 collection initialization"

# List a property
echo -e "\n=== 3. Property Management ==="
echo "3.1 Listing property..."
dfx canister call test_ireits_backend list_property \
  "(500000.0, \"123 Main St\", \"Beautiful property\", opt record { monthly_amount = 5000:nat64; last_distribution = 0:nat64; distribution_frequency = 2592000:nat64 })"
check_success "Property listing"

# Add property document
echo "3.2 Adding property document..."
dfx canister call test_ireits_backend add_document \
  "(1:nat64, variant { Deed }, \"QmHash123\")"
check_success "Document addition"

# Verify property listing
echo "3.3 Verifying property..."
dfx canister call test_ireits_backend get_property "(1:nat64)"
check_success "Property verification"

# Tokenize property
echo -e "\n=== 4. Property Tokenization ==="
echo "4.1 Tokenizing property..."
dfx canister call test_ireits_backend tokenize_property \
  "(1:nat64, \"123 Main St Token\", \"MAIN\", opt \"Tokenized property\", 1000:nat64, 100:nat64, opt (250:nat16))"
check_success "Property tokenization"

# Fractionalize property
echo "4.2 Fractionalizing property..."
dfx canister call test_ireits_backend fractionalize_property \
  "(1:nat64, vec {
    record { principal \"$PRINCIPAL\"; 10000:nat16 }
  })"
check_success "Property fractionalization"

# Get property stats
echo -e "\n=== 5. System Stats ==="
echo "5.1 Getting property stats..."
dfx canister call test_ireits_backend get_property "(1:nat64)"
check_success "Property stats"

# Get RET token stats
echo "5.2 Getting RET token stats..."
dfx canister call test_ireits_backend get_ret_stats
check_success "RET token stats"

echo -e "\n✅ Integration test completed successfully!"
echo "All core components verified and working together." 