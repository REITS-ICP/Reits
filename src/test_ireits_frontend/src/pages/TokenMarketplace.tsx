import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Principal } from '@dfinity/principal';

interface PropertyToken {
  token_id: bigint;
  owner: Principal;
  metadata: {
    name: string;
    symbol: string;
    description?: string;
    image?: Uint8Array;
    royalties?: number;
    royalty_recipient?: Principal;
  };
  property_id: bigint;
  total_supply: bigint;
  price_per_token: bigint;
  available_supply: bigint;
  use_usdt: boolean;
}

interface TokenMarketplaceProps {
  actor: any;
  userPrincipal: Principal | null;
}

const TokenMarketplace: React.FC<TokenMarketplaceProps> = ({ actor, userPrincipal }) => {
  const [availableTokens, setAvailableTokens] = useState<PropertyToken[]>([]);
  const [userTokens, setUserTokens] = useState<PropertyToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseAmount, setPurchaseAmount] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, [actor, userPrincipal]);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const allTokens = await actor.get_all_properties();
      const tokenizedProperties = allTokens.filter(
        (prop: any) => prop.status.hasOwnProperty('Tokenized') && prop.token_id
      );

      const tokens: PropertyToken[] = [];
      for (const prop of tokenizedProperties) {
        const token = await actor.get_token(prop.token_id[0]);
        if (token && token[0]) {
          tokens.push(token[0]);
        }
      }

      setAvailableTokens(tokens.filter(token => token.available_supply > 0n));

      if (userPrincipal) {
        const userTokens = await actor.get_user_tokens(userPrincipal);
        setUserTokens(userTokens);
      }
    } catch (err) {
      console.error('Error loading tokens:', err);
      setError('Failed to load tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (token: PropertyToken) => {
    try {
      setError(null);
      setSuccess(null);
      const amount = BigInt(purchaseAmount[token.token_id.toString()] || '0');
      
      if (amount <= 0n || amount > token.available_supply) {
        setError('Invalid purchase amount');
        return;
      }

      const result = await actor.purchase_tokens(token.token_id, amount);
      if ('Ok' in result) {
        setSuccess(`Successfully purchased ${amount.toString()} tokens!`);
        loadTokens(); // Reload tokens to update balances
        setPurchaseAmount({ ...purchaseAmount, [token.token_id.toString()]: '' });
      } else {
        setError(result.Err || 'Failed to purchase tokens');
      }
    } catch (err) {
      console.error('Error purchasing tokens:', err);
      setError('Failed to purchase tokens. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-500 mb-8">Token Marketplace</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 text-white p-4 rounded-md mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTokens.map((token) => (
            <motion.div
              key={token.token_id.toString()}
              whileHover={{ scale: 1.02 }}
              className="bg-black p-6 rounded-xl border border-yellow-500/20"
            >
              <h3 className="text-xl font-bold text-yellow-500 mb-2">
                {token.metadata.name}
              </h3>
              <p className="text-gray-400 mb-4">
                {token.metadata.description || 'No description available'}
              </p>
              
              <div className="space-y-2 text-gray-300">
                <p>Symbol: {token.metadata.symbol}</p>
                <p>Available: {token.available_supply.toString()} tokens</p>
                <p>Price: {token.price_per_token.toString()} {token.use_usdt ? 'cKUSDT' : 'cKUSDC'}</p>
                
                <div className="mt-4">
                  <input
                    type="number"
                    value={purchaseAmount[token.token_id.toString()] || ''}
                    onChange={(e) => setPurchaseAmount({
                      ...purchaseAmount,
                      [token.token_id.toString()]: e.target.value
                    })}
                    placeholder="Amount to purchase"
                    className="w-full p-2 rounded-md bg-gray-800 text-white border border-yellow-500/20 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePurchase(token)}
                    className="w-full mt-2 bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors duration-200"
                  >
                    Purchase Tokens
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {userTokens.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-yellow-500 mb-6">Your Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTokens.map((token) => (
                <motion.div
                  key={token.token_id.toString()}
                  whileHover={{ scale: 1.02 }}
                  className="bg-black p-6 rounded-xl border border-yellow-500/20"
                >
                  <h3 className="text-xl font-bold text-yellow-500 mb-2">
                    {token.metadata.name}
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Balance: {token.total_supply.toString()} tokens</p>
                    <p>Token Type: {token.use_usdt ? 'cKUSDT' : 'cKUSDC'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenMarketplace; 