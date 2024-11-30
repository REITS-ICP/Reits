import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Principal } from '@dfinity/principal';

interface TokenDetailsProps {
  token: {
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
  };
  property: {
    rental_income?: {
      monthly_amount: bigint;
      last_distribution: bigint;
      distribution_frequency: bigint;
    };
  };
  actor: any;
  onClose: () => void;
  onSuccess: () => void;
}

const TokenDetails: React.FC<TokenDetailsProps> = ({
  token,
  property,
  actor,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributionAmount, setDistributionAmount] = useState('');

  const handleDistributeIncome = async () => {
    try {
      setLoading(true);
      setError(null);
      const amount = BigInt(distributionAmount);

      if (amount <= 0n) {
        setError('Invalid distribution amount');
        return;
      }

      const result = await actor.distribute_token_income(
        token.token_id,
        amount,
        token.use_usdt
      );

      if ('Ok' in result) {
        onSuccess();
        onClose();
      } else {
        setError(result.Err || 'Failed to distribute income');
      }
    } catch (err) {
      console.error('Error distributing income:', err);
      setError('Failed to distribute income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleString();
  };

  const calculateNextDistribution = () => {
    if (!property.rental_income) return 'Not configured';
    
    const lastDistribution = property.rental_income.last_distribution;
    const frequency = property.rental_income.distribution_frequency;
    const nextTimestamp = lastDistribution + frequency;
    
    return formatTimestamp(nextTimestamp);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-yellow-500/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-500">
            {token.metadata.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">Token Details</h3>
            <p>Symbol: {token.metadata.symbol}</p>
            <p>Total Supply: {token.total_supply.toString()}</p>
            <p>Available Supply: {token.available_supply.toString()}</p>
            <p>Price per Token: {token.price_per_token.toString()} {token.use_usdt ? 'cKUSDT' : 'cKUSDC'}</p>
            {token.metadata.royalties && (
              <p>Royalties: {(Number(token.metadata.royalties) / 100).toFixed(2)}%</p>
            )}
          </div>

          {property.rental_income && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Rental Income</h3>
              <p>Monthly Amount: {property.rental_income.monthly_amount.toString()} {token.use_usdt ? 'cKUSDT' : 'cKUSDC'}</p>
              <p>Last Distribution: {formatTimestamp(property.rental_income.last_distribution)}</p>
              <p>Next Distribution: {calculateNextDistribution()}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">Distribute Income</h3>
            <div className="space-y-2">
              <input
                type="number"
                value={distributionAmount}
                onChange={(e) => setDistributionAmount(e.target.value)}
                placeholder="Amount to distribute"
                className="w-full p-2 rounded-md bg-gray-800 text-white border border-yellow-500/20 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDistributeIncome}
                disabled={loading}
                className={`w-full bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Distribute Income'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenDetails; 