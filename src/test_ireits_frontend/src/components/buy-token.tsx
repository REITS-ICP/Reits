import React, { useState } from 'react';
import axios from 'axios';

const BuyToken: React.FC = () => {
  const [tokenId, setTokenId] = useState<number>(0);
  const [buyerPublicKey, setBuyerPublicKey] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Reset message

    try {
      const response = await axios.post('/api/buy-token', {
        token_id: tokenId,
        buyer_public_key: buyerPublicKey,
      });

      // Handle success
      setMessage(`Successfully bought token: ${response.data.id}`);
    } catch (error: unknown) {
      // Handle error
      if (axios.isAxiosError(error) && error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('An unexpected error occurred.');
      }
    }
  };
  return (
    <div className="buy-token-container">
      <h2 className="text-2xl font-bold mb-4">Buy Token</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
            Token ID
          </label>
          <input
            type="number"
            id="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(Number(e.target.value))}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="buyerPublicKey" className="block text-sm font-medium text-gray-700">
            Your Public Key
          </label>
          <input
            type="text"
            id="buyerPublicKey"
            value={buyerPublicKey}
            onChange={(e) => setBuyerPublicKey(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700"
        >
          Buy Token
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default BuyToken;