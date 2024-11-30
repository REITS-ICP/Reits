import React from "react";
import { TracingBeam } from "../components/ui/tracing-beam";
import { LampContainer } from "../components/ui/lampDemo";

const PropertyPages = [
  {
    title: "Properties listed on our platform",
    description:
      "The PropVest Platform is a decentralized, blockchain-based solution aimed at transforming the real estate investment landscape.",
    points: [
      "The IREITs Platform is a decentralized, blockchain-based solution aimed at transforming the real estate investment landscape.",
    ],
  },
  {
    title: "Key Features:",
    description:
      "Built on the Internet Computer Protocol (ICP), our platform ensures every transaction is securely recorded on-chain, guaranteeing transparency and immutability of data.",
    points: [
      "Fractional Ownership: We democratize real estate by breaking down large, income-generating properties",
    ],
  
  },
  {
    title: "Why Choose Us?",
    description:
      "Low Minimum Investment: You don’t need to be a millionaire to invest in real estate. With our platform, you can start small and grow your portfolio.",
    points: [
      "Secure Transactions: Powered by smart contracts, our platform ensures that every property transaction and dividend distribution is handled securely without manual interference.  Liquidity and Flexibility: Unlike traditional real estate, you can easily trade your fractional ownership tokens on the open market, offering greater liquidity and flexibility.",
    ],
  },
];

const PropertyPage = () => {
  return (
    <div className="py-4 px-4 sm:px-6 lg:px-8 bg-poultry-dark text-white">
      <h2 className="text-3xl font-bold text-center text-poultry-pink mb-2">
        About IREIT TOKENIZATION.
      </h2>
      <TracingBeam className="mb-1">
        {PropertyPages.map((feature, index) => (
          <LampContainer key={index} className="mb-2">
            <div className="p-2 bg-poultry-dark border border-white rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-purple-orange mb-1">
                {feature.title}
              </h3>
              <p className="text-white mb-2">{feature.description}</p>
              <ul className="text-white list-disc list-inside">
                {feature.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </LampContainer>
        ))}
      </TracingBeam>
    </div>
  );
};

export default PropertyPage;