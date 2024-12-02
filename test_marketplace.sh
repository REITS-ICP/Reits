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
dfx identity new --disable-encryption share_buyer1 || true
dfx identity new --disable-encryption share_buyer2 || true
check_success "Creating test users"

OWNER_PRINCIPAL=$(dfx --identity property_owner identity get-principal)
BUYER1_PRINCIPAL=$(dfx --identity share_buyer1 identity get-principal)
BUYER2_PRINCIPAL=$(dfx --identity share_buyer2 identity get-principal)

# Airdrop RET to users
echo -e "\n3. Airdropping RET to users..."
dfx canister call test_ireits_backend airdrop_ret \
  "(vec { 
    record { principal \"$OWNER_PRINCIPAL\"; 1_000_000:nat64 };
    record { principal \"$BUYER1_PRINCIPAL\"; 500_000:nat64 };
    record { principal \"$BUYER2_PRINCIPAL\"; 500_000:nat64 }
  })"
check_success "RET airdrop"

# Switch to property owner
dfx identity use property_owner
check_success "Switching to property owner identity"

# List a property
echo -e "\n4. Listing a property..."
dfx canister call test_ireits_backend list_property \
  "(100000.0, \"123 Main St\", \"Beautiful property\", null)"
check_success "Property listing"

# Tokenize the property
echo -e "\n5. Tokenizing property..."
dfx canister call test_ireits_backend tokenize_property \
  "(1:nat64, \"123 Main St Token\", \"MAIN\", opt \"Tokenized 123 Main St property\", 1000:nat64, 100:nat64, opt (250:nat16))"
check_success "Property tokenization"

# Fractionalize the property
echo -e "\n6. Fractionalizing property..."
dfx canister call test_ireits_backend fractionalize_property \
  "(1:nat64, vec {
    record { principal \"$BUYER1_PRINCIPAL\"; 5000:nat16 };
    record { principal \"$BUYER2_PRINCIPAL\"; 5000:nat16 }
  })"
check_success "Property fractionalization"

# List property on marketplace
echo -e "\n7. Listing property on marketplace..."
dfx canister call test_ireits_backend list_property_marketplace \
  "(1:nat64, record { amount = 1000:nat64; token_type = variant { RET } }, 250:nat16)"
check_success "Marketplace listing"

# Switch to buyer1
dfx identity use share_buyer1
check_success "Switching to buyer1 identity"

# Place bid
echo -e "\n8. Placing bid..."
dfx canister call test_ireits_backend place_bid \
  "(1:nat64, 1000:nat64, variant { RET })"
check_success "Placing first bid"

# Switch to buyer2
dfx identity use share_buyer2
check_success "Switching to buyer2 identity"

# Place higher bid
echo -e "\n9. Placing higher bid..."
dfx canister call test_ireits_backend place_bid \
  "(1:nat64, 1200:nat64, variant { RET })"
check_success "Placing second bid"

# Switch back to owner
dfx identity use property_owner
check_success "Switching back to owner identity"

# Accept highest bid
echo -e "\n10. Accepting highest bid..."
dfx canister call test_ireits_backend accept_bid "(1:nat64)"
check_success "Accepting highest bid"

# Distribute RET rewards
echo -e "\n11. Distributing RET rewards..."
dfx canister call test_ireits_backend distribute_ret_rewards "(1:nat64, 1000:nat64)"
check_success "Distributing RET rewards"

# Get marketplace stats
echo -e "\n12. Getting marketplace stats..."
dfx canister call test_ireits_backend get_marketplace_stats
check_success "Retrieving marketplace stats"

# Verify property shares
echo -e "\n13. Verifying property shares..."
dfx canister call test_ireits_backend get_property_shares "(1:nat64)"
check_success "Verifying property shares"

# Switch back to default identity
dfx identity use default
check_success "Switching back to default identity"

echo -e "\n✅ Marketplace test sequence completed successfully!" 