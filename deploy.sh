#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate QR code
generate_qr_code() {
    local account_id=$1
    if command_exists qrencode; then
        echo -e "\n${GREEN}Generating QR code for your ICP account...${NC}"
        qrencode -t UTF8 "$account_id"
    else
        echo -e "\n${YELLOW}To display QR code, install qrencode:${NC}"
        echo "sudo apt-get install qrencode"
    fi
}

echo -e "${YELLOW}Starting RWA Token Deployment to ICP Mainnet...${NC}"

# Check for dfx.json
if [ ! -f "dfx.json" ]; then
    echo -e "${RED}dfx.json not found. Please ensure you're in the correct directory.${NC}"
    exit 1
fi

# Step 0: Setup ICP mainnet wallet
echo -e "\n${GREEN}0. Setting up ICP mainnet wallet...${NC}"

# Get current identity
CURRENT_IDENTITY=$(dfx identity whoami)
PRINCIPAL=$(dfx identity get-principal)

echo -e "Current identity: ${YELLOW}$CURRENT_IDENTITY${NC}"
echo -e "Principal ID: ${YELLOW}$PRINCIPAL${NC}"

# Check if wallet exists
if ! dfx identity get-wallet --network ic > /dev/null 2>&1; then
    echo -e "\n${RED}No wallet found for your identity.${NC}"
    echo -e "\n${YELLOW}Before creating a wallet, you need:${NC}"
    echo -e "1. ICP tokens in your account (minimum 1 ICP recommended)"
    echo -e "2. Your account address to receive ICP tokens"
    
    # Get account ID and generate QR code
    echo -e "\n${GREEN}Your ICP account ID:${NC}"
    ACCOUNT_ID=$(dfx ledger account-id)
    echo -e "${YELLOW}$ACCOUNT_ID${NC}"
    
    # Generate QR code for the account ID
    generate_qr_code "$ACCOUNT_ID"

    echo -e "\n${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Transfer ICP tokens to your account ID shown above (scan QR code)"
    echo -e "2. Wait for the transfer to be confirmed"
    echo -e "3. Run this script again"
    echo -e "\nYou can get ICP tokens from:"
    echo -e "- An exchange (Binance, Coinbase, etc.)"
    echo -e "- The ICP faucet (for testnet)"
    echo -e "- Another ICP wallet\n"
    
    read -p "Do you have ICP tokens in your account? (yes/no): " has_tokens
    
    if [[ $has_tokens != "yes" ]]; then
        echo -e "${YELLOW}Please get some ICP tokens first and run this script again.${NC}"
        exit 1
    fi
    
    # Create new wallet canister
    echo -e "\n${GREEN}Creating wallet canister...${NC}"
    dfx ledger --network ic create-canister $PRINCIPAL --amount 1
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create wallet canister. Please ensure you have enough ICP tokens.${NC}"
        exit 1
    fi
    
    # Get the wallet canister ID
    WALLET_CANISTER_ID=$(dfx ledger --network ic create-canister $PRINCIPAL --amount 1 | grep "Principal" | awk '{print $2}')
    
    if [ -z "$WALLET_CANISTER_ID" ]; then
        echo -e "${RED}Failed to get wallet canister ID. Please try again.${NC}"
        exit 1
    fi
    
    echo -e "Wallet canister created with ID: ${GREEN}$WALLET_CANISTER_ID${NC}"
    
    # Install wallet code
    echo -e "\n${GREEN}Installing wallet code...${NC}"
    dfx identity --network ic set-wallet $WALLET_CANISTER_ID
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to set wallet. Please try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Wallet setup complete!${NC}"
else
    WALLET_ID=$(dfx identity get-wallet --network ic)
    echo -e "Using existing wallet: ${GREEN}$WALLET_ID${NC}"
fi

# Verify wallet setup
echo -e "\n${GREEN}Verifying wallet setup...${NC}"
CYCLES_BALANCE=$(dfx wallet --network ic balance)
echo -e "Current cycles balance: ${YELLOW}$CYCLES_BALANCE${NC}"

if [[ $CYCLES_BALANCE == *"0"* ]]; then
    echo -e "${RED}Your wallet has no cycles. You need cycles to deploy canisters.${NC}"
    echo -e "\n${YELLOW}To get cycles:${NC}"
    echo -e "1. Convert ICP to cycles using:"
    echo -e "   dfx ledger --network ic create-canister $PRINCIPAL --amount <icp-amount>"
    echo -e "2. Or get cycles from: https://networknervoussystem.com/"
    exit 1
fi

# Continue with deployment only if we have cycles
echo -e "\n${YELLOW}Do you want to continue with the deployment? (yes/no):${NC}"
read -p "> " continue_deploy

if [[ $continue_deploy != "yes" ]]; then
    echo -e "${YELLOW}Deployment cancelled. Run the script again when you're ready.${NC}"
    exit 0
fi

# Prompt for Treasury Principal ID
echo -e "\n${YELLOW}Please enter your Treasury Principal ID:${NC}"
read -p "> " TREASURY_PRINCIPAL_ID

# Validate Principal ID format (basic check)
if [[ ! $TREASURY_PRINCIPAL_ID =~ ^[a-z0-9-]{5,63}$ ]]; then
    echo -e "${RED}Invalid Principal ID format. Please check your input.${NC}"
    exit 1
fi

# Step 1: Start local replica in the background
echo -e "\n${GREEN}1. Starting local replica...${NC}"
dfx start --background --clean

# Check if replica started successfully
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start local replica. Please check if dfx is installed correctly.${NC}"
    exit 1
fi

# Wait for replica to be ready
sleep 5

# Step 2: Create canisters
echo -e "\n${GREEN}2. Creating canisters...${NC}"
dfx canister create --all

# Step 3: Build the project
echo -e "\n${GREEN}3. Building the project...${NC}"
npm install
dfx build

# Step 4: Check cycles balance and deploy to mainnet
echo -e "\n${GREEN}4. Deploying to ICP Mainnet...${NC}"
echo -e "${YELLOW}Checking cycles wallet balance...${NC}"
CYCLES_BALANCE=$(dfx wallet --network ic balance)
if [[ $CYCLES_BALANCE == *"0"* ]]; then
    echo -e "${RED}Insufficient cycles in wallet. Please top up your cycles wallet before deploying to mainnet.${NC}"
    echo -e "You can get cycles from: https://networknervoussystem.com/"
    echo -e "Or convert ICP to cycles using: dfx ledger --network ic create-canister <your-principal> --amount <icp-amount>${NC}"
    exit 1
fi

# Deploy to mainnet with retries
MAX_RETRIES=3
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if dfx deploy --network ic --with-cycles 1000000000000; then
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo -e "${RED}Failed to deploy after $MAX_RETRIES attempts. Please check your network connection and cycles balance.${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Deployment failed. Retrying... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
        sleep 5
    fi
done

# Get the deployed canister ID
BACKEND_CANISTER_ID=$(dfx canister --network ic id test_ireits_backend)

# Step 5: Initialize the collection
echo -e "\n${GREEN}5. Initializing RWA Token Collection...${NC}"
dfx canister --network ic call "$BACKEND_CANISTER_ID" initialize_collection "(
    record {
        name = \"RWA Collection\";
        symbol = \"RWAC\";
        description = \"Real World Asset Collection on ICP\";
        royalties = 250;
        treasury = principal \"$TREASURY_PRINCIPAL_ID\";
        max_supply = opt 1000000;
        logo = null;
        website = opt \"https://rwa-platform.icp\";
        social_links = opt vec { \"https://twitter.com/REIT_DeFi\"; \"https://discord.gg/rwa\" }
    }
)"

# Step 6: Initialize payment managers (USDC and USDT)
echo -e "\n${GREEN}6. Initializing Payment Managers...${NC}"
dfx canister --network ic call "$BACKEND_CANISTER_ID" initialize_payment_manager "(
    record {
        usdc = principal \"mxzaz-hqaaa-aaaar-qaada-cai\";
        usdt = principal \"6nmrm-laaaa-aaaar-qaadq-cai\"
    }
)"

echo -e "\n${YELLOW}Deployment Complete!${NC}"
echo -e "\nDeployment completed with:"
echo -e "Treasury Principal ID: ${GREEN}$TREASURY_PRINCIPAL_ID${NC}"
echo -e "Backend Canister ID: ${GREEN}$BACKEND_CANISTER_ID${NC}"

# Display all deployed canister IDs
echo -e "\n${GREEN}All Deployed Canister IDs:${NC}"
dfx canister --network ic id test_ireits_backend
dfx canister --network ic id test_ireits_frontend

# Cleanup: Stop the replica
echo -e "\n${GREEN}Stopping local replica...${NC}"
dfx stop 