# Test Scripts

This directory contains test scripts for various components of the RWA (Real World Assets) system.

## Available Tests

1. `test_integration.sh`
   - Comprehensive integration test
   - Tests all core components working together
   - Includes: RET token, ICRC7 token, property management, tokenization

2. `test_icrc7.sh`
   - Tests ICRC7 token implementation
   - Covers: collection initialization, minting, transfers, approvals

3. `test_ret_token.sh`
   - Tests RET token functionality
   - Covers: initialization, staking, unstaking, transfers

4. `test_marketplace.sh`
   - Tests marketplace operations
   - Covers: listing, bidding, sales completion

5. `test_distributions.sh`
   - Tests rental income distribution
   - Covers: property income, token rewards

## Running Tests

To run any test script:
```bash
cd tests
chmod +x test_script_name.sh
./test_script_name.sh
```

Each test script includes success/failure indicators:
- ✅ Success
- ❌ Failed
- ⚠️ Warning (non-critical) 