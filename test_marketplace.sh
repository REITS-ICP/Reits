#!/bin/bash

# Start local replica if not running
dfx start --background --clean

# Deploy the canister
dfx deploy

# Store identity principal
PRINCIPAL=$(dfx identity get-principal)
echo "Using principal: $PRINCIPAL"

# Initialize RET token
echo -e "\n1. Initializing RET token..."
dfx canister call test_ireits_backend initialize_ret \
  "(principal \"$PRINCIPAL\", opt \"https://ireit.com\", null)"

# Create test users
echo -e "\n2. Creating test users..."
dfx identity new --disable-encryption property_owner || true
dfx identity new --disable-encryption share_buyer1 || true
dfx identity new --disable-encryption share_buyer2 || true

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

# Switch to property owner
dfx identity use property_owner

# List a property
echo -e "\n4. Listing a property..."
dfx canister call test_ireits_backend list_property \
  "(100000.0, \"123 Main St\", \"Beautiful property\", null)"

# Tokenize the property
echo -e "\n5. Tokenizing property..."
dfx canister call test_ireits_backend tokenize_property \
  "(1:nat64, \"123 Main St Token\", \"MAIN\", opt \"Tokenized 123 Main St property\", 1000:nat64, 100:nat64, opt (250:nat16))"

# Fractionalize the property
echo -e "\n6. Fractionalizing property..."
dfx canister call test_ireits_backend fractionalize_property \
  "(1:nat64, vec {
    record { principal \"$BUYER1_PRINCIPAL\"; 5000:nat16 };
    record { principal \"$BUYER2_PRINCIPAL\"; 5000:nat16 }
  })"

# List property on marketplace
echo -e "\n7. Listing property on marketplace..."
dfx canister call test_ireits_backend list_property_marketplace \
  "(1:nat64, record { amount = 1000:nat64; token_type = variant { RET } }, 250:nat16)"

# Switch to buyer1
dfx identity use share_buyer1

# Place bid
echo -e "\n8. Placing bid..."
dfx canister call test_ireits_backend place_bid \
  "(1:nat64, 1000:nat64, variant { RET })"

# Switch to buyer2
dfx identity use share_buyer2

# Place higher bid
echo -e "\n9. Placing higher bid..."
dfx canister call test_ireits_backend place_bid \
  "(1:nat64, 1200:nat64, variant { RET })"

# Switch back to owner
dfx identity use property_owner

# Accept highest bid
echo -e "\n10. Accepting highest bid..."
dfx canister call test_ireits_backend accept_bid "(1:nat64)"

# Distribute RET rewards
echo -e "\n11. Distributing RET rewards..."
dfx canister call test_ireits_backend distribute_ret_rewards "(1:nat64, 1000:nat64)"

# Get marketplace stats
echo -e "\n12. Getting marketplace stats..."
dfx canister call test_ireits_backend get_marketplace_stats

# Verify property shares
echo -e "\n13. Verifying property shares..."
dfx canister call test_ireits_backend get_property_shares "(1:nat64)"

# Switch back to default identity
dfx identity use default

echo -e "\nMarketplace test sequence completed!" 