#[cfg(test)]
mod tests {
    use super::super::icrc7_token::*;
    use candid::Principal;
    use ic_cdk::api::time;

    fn setup_test_collection() -> bool {
        ICRC7Token::initialize_collection(
            "Test Collection".to_string(),
            "TEST".to_string(),
            "Test NFT Collection".to_string(),
            250, // 2.5% royalties
            Principal::anonymous(),
            Some(1000),
            None,
            Some("https://test.com".to_string()),
            Some(vec!["https://twitter.com/test".to_string()]),
        )
    }

    fn create_test_metadata() -> TokenMetadata {
        TokenMetadata {
            name: "Test Token".to_string(),
            symbol: "TEST".to_string(),
            description: Some("Test Token Description".to_string()),
            logo: None,
            content_type: None,
            decimals: 0,
            website: None,
            social_links: None,
            supply_cap: Some(1),
            image: None,
            royalties: Some(250),
            royalty_recipient: Some(Principal::anonymous()),
            tags: Some(vec!["test".to_string()]),
            created_at: time(),
            modified_at: time(),
        }
    }

    #[test]
    fn test_collection_initialization() {
        assert!(setup_test_collection());
        assert_eq!(ICRC7Token::name(), "Test Collection");
        assert_eq!(ICRC7Token::symbol(), "TEST");
        assert_eq!(ICRC7Token::total_supply(), 0);
        assert_eq!(ICRC7Token::max_supply(), Some(1000));
    }

    #[test]
    fn test_token_minting() {
        assert!(setup_test_collection());
        let owner = Principal::anonymous();
        let metadata = create_test_metadata();
        
        let token_id = ICRC7Token::mint(owner, metadata.clone(), false);
        assert!(token_id.is_some());
        assert_eq!(token_id, Some(1));
        
        let token = ICRC7Token::get_token(1);
        assert!(token.is_some());
        let token = token.unwrap();
        assert_eq!(token.owner, owner);
        assert_eq!(token.metadata.name, metadata.name);
        assert_eq!(ICRC7Token::total_supply(), 1);
    }

    #[test]
    fn test_token_transfer() {
        assert!(setup_test_collection());
        let owner = Principal::anonymous();
        let recipient = Principal::from_text("2vxsx-fae").unwrap();
        
        // Mint token
        let token_id = ICRC7Token::mint(owner, create_test_metadata(), false).unwrap();
        
        // Transfer token
        let transfer_args = TransferArgs {
            spender_subaccount: None,
            from: owner,
            to: recipient,
            token_id,
            memo: None,
            created_at_time: None,
        };
        
        let result = ICRC7Token::transfer(transfer_args);
        assert!(result.is_ok());
        
        // Verify ownership change
        assert_eq!(ICRC7Token::owner_of(token_id), Some(recipient));
        assert_eq!(ICRC7Token::balance_of(owner), 0);
        assert_eq!(ICRC7Token::balance_of(recipient), 1);
    }

    #[test]
    fn test_token_approval() {
        assert!(setup_test_collection());
        let owner = Principal::anonymous();
        let spender = Principal::from_text("2vxsx-fae").unwrap();
        
        // Mint token
        let token_id = ICRC7Token::mint(owner, create_test_metadata(), false).unwrap();
        
        // Approve token
        let approval_args = ApprovalArgs {
            from_subaccount: None,
            spender,
            token_id,
            expires_at: None,
            memo: None,
            created_at_time: None,
        };
        
        let result = ICRC7Token::approve(approval_args);
        assert!(result.is_ok());
        
        // Verify approval
        let approved = ICRC7Token::get_approved(token_id);
        assert!(approved.is_some());
        let (approved_spender, _) = approved.unwrap();
        assert_eq!(approved_spender, spender);
    }

    #[test]
    fn test_transfer_restrictions() {
        assert!(setup_test_collection());
        let owner = Principal::anonymous();
        let recipient = Principal::from_text("2vxsx-fae").unwrap();
        
        // Mint restricted token
        let token_id = ICRC7Token::mint(owner, create_test_metadata(), true).unwrap();
        
        // Attempt transfer
        let transfer_args = TransferArgs {
            spender_subaccount: None,
            from: owner,
            to: recipient,
            token_id,
            memo: None,
            created_at_time: None,
        };
        
        let result = ICRC7Token::transfer(transfer_args);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Token transfers are restricted");
    }

    #[test]
    fn test_token_stats() {
        assert!(setup_test_collection());
        let owner = Principal::anonymous();
        let recipient = Principal::from_text("2vxsx-fae").unwrap();
        
        // Mint token
        let token_id = ICRC7Token::mint(owner, create_test_metadata(), false).unwrap();
        
        // Check initial stats
        let stats = ICRC7Token::get_token_stats(token_id).unwrap();
        assert_eq!(stats.total_transactions, 0);
        assert_eq!(stats.unique_holders, 1);
        
        // Transfer token
        let transfer_args = TransferArgs {
            spender_subaccount: None,
            from: owner,
            to: recipient,
            token_id,
            memo: None,
            created_at_time: None,
        };
        
        ICRC7Token::transfer(transfer_args).unwrap();
        
        // Check updated stats
        let stats = ICRC7Token::get_token_stats(token_id).unwrap();
        assert_eq!(stats.total_transactions, 1);
    }
} 