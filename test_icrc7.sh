#!/bin/bash

# Start local replica if not running
dfx start --background --clean

# Deploy the canister
dfx deploy

# Store identity principal
PRINCIPAL=$(dfx identity get-principal)
echo "Using principal: $PRINCIPAL"

# Initialize token collection
echo -e "\n1. Initializing token collection..."
dfx canister call test_ireits_backend initialize_collection \
  "(\"Real Estate Tokens\", \"RET\", \"Tokenized Real Estate Properties\", 250:nat16, principal \"$PRINCIPAL\", null, null, opt \"https://example.com\", null)"

# Verify collection info
echo -e "\n2. Verifying collection info..."
dfx canister call test_ireits_backend get_collection_info

# List a property
echo -e "\n3. Listing a property..."
dfx canister call test_ireits_backend list_property \
  "(100000.0, \"123 Main St\", \"Beautiful property\", null)"

# Get all properties
echo -e "\n4. Getting all properties..."
dfx canister call test_ireits_backend get_all_properties

# Tokenize the property
echo -e "\n5. Tokenizing property..."
dfx canister call test_ireits_backend tokenize_property \
  "(1:nat64, \"123 Main St Token\", \"MAIN\", opt \"Tokenized 123 Main St property\", 1000:nat64, 100:nat64, opt (250:nat16))"

# Get token info
echo -e "\n6. Getting token info..."
dfx canister call test_ireits_backend get_token "(1:nat64)"

# Get token stats
echo -e "\n7. Getting token stats..."
dfx canister call test_ireits_backend get_token_stats "(1:nat64)"

# Get user tokens
echo -e "\n8. Getting user tokens..."
dfx canister call test_ireits_backend get_user_tokens "(principal \"$PRINCIPAL\")"

# Create another identity for transfer test
echo -e "\n9. Creating new identity for transfer test..."
dfx identity new --disable-encryption test_buyer || true
BUYER_PRINCIPAL=$(dfx --identity test_buyer identity get-principal)
echo "Buyer principal: $BUYER_PRINCIPAL"

# Transfer token
echo -e "\n10. Transferring token..."
dfx canister call test_ireits_backend transfer \
  "( record { 
      spender_subaccount = null;
      from = principal \"$PRINCIPAL\";
      to = principal \"$BUYER_PRINCIPAL\";
      token_id = 1:nat64;
      memo = null;
      created_at_time = null
    })"

# Verify token ownership
echo -e "\n11. Verifying token ownership..."
dfx canister call test_ireits_backend owner_of "(1:nat64)"

# Get updated token stats
echo -e "\n12. Getting updated token stats..."
dfx canister call test_ireits_backend get_token_stats "(1:nat64)"

# Get property status
echo -e "\n13. Getting property status..."
dfx canister call test_ireits_backend get_property "(1:nat64)"

# Switch back to default identity
dfx identity use default

echo -e "\nTest sequence completed!" 