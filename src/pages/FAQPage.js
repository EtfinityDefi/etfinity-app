import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons for accordion

const FAQPage = () => {
  // State to manage which FAQ item is currently open
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "What is Etfinity?",
      answer: "Etfinity is a decentralized finance (DeFi) platform that allows users to mint, redeem, and trade synthetic ETFs (Exchange-Traded Funds) directly from their crypto wallets. It aims to provide access to traditional market assets without the need for brokers or banks."
    },
    {
      id: 2,
      question: "What is sSPY?",
      answer: "sSPY is the first synthetic asset launched on Etfinity. It's designed to algorithmically track the price of the S&P 500 index, allowing users to gain exposure to the performance of the top 500 U.S. companies in a decentralized manner."
    },
    {
      id: 3,
      question: "How do I mint sSPY?",
      answer: "To mint sSPY, you need to provide a specified amount of collateral (e.g., USDC, DAI) that exceeds the value of the sSPY you wish to mint (e.g., 150% collateralization ratio). This overcollateralization helps maintain the peg and protocol solvency."
    },
    {
      id: 4,
      question: "How do I redeem sSPY?",
      answer: "You can redeem your sSPY tokens for the underlying collateral by interacting with the Etfinity protocol. When you redeem, the sSPY is burned, and a proportional amount of your collateral is returned to your wallet, adjusted for any protocol fees."
    },
    {
      id: 5,
      question: "What is the liquidity pool for?",
      answer: "The liquidity pool (LP) enables seamless trading and price stability for sSPY. Users can provide liquidity by depositing both sSPY and USDC (or other supported stablecoins) into the pool, earning a share of the trading fees as a reward."
    },
    {
      id: 6,
      question: "Is Etfinity regulated?",
      answer: "Etfinity is a decentralized protocol operating on a blockchain. It is not regulated by traditional financial authorities in the same way as centralized financial institutions. Users should understand the risks associated with decentralized finance and synthetic assets."
    },
    {
        id: 7,
        question: "What are the risks involved?",
        answer: "Risks include smart contract vulnerabilities, oracle failures (if the price feed is inaccurate), impermanent loss for liquidity providers, and de-pegging risk if the synthetic asset loses its correlation with the underlying index."
    },
    {
        id: 8,
        question: "How are the S&P 500 prices sourced?",
        answer: "Etfinity relies on decentralized oracle networks (like Chainlink) to securely and reliably bring off-chain S&P 500 price data onto the blockchain, ensuring the synthetic asset's peg is maintained."
    }
  ];

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id); // Open or close the clicked question
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">
        Frequently Asked Questions
      </h2>

      <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700">
        {faqs.map(faq => (
          <div key={faq.id} className="border-b border-zinc-700 last:border-b-0 py-4">
            <button
              onClick={() => toggleQuestion(faq.id)}
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-white hover:text-purple-400 transition-colors duration-200 focus:outline-none"
              aria-expanded={openQuestion === faq.id ? "true" : "false"}
              aria-controls={`faq-answer-${faq.id}`}
            >
              {faq.question}
              {openQuestion === faq.id ? (
                <ChevronUp size={24} className="text-purple-400" />
              ) : (
                <ChevronDown size={24} className="text-zinc-400" />
              )}
            </button>
            {openQuestion === faq.id && (
              <p id={`faq-answer-${faq.id}`} className="mt-3 text-zinc-300 text-lg pr-8 animate-fade-in">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default FAQPage;