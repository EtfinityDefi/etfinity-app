'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DollarSign, ArrowRightLeft, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Import ABIs for ERC20, Chainlink Aggregator V3, and Etfinity Protocol contracts.
import { erc20Abi } from '../contracts/abi/Erc20Abi';
import { chainlinkAggregatorV3Abi } from '../contracts/abi/ChainlinkAggregatorV3Abi';
import { etfinityProtocolAbi } from '../contracts/abi/EtfinityProtocolAbi';

/**
 * @dev Defines all deployed contract addresses per network.
 * These values are loaded from environment variables (e.g., .env.local).
 * Ensure these addresses are correctly configured for each supported chain.
 */
const CONTRACT_ADDRESSES: Record<number, {
  USDC: `0x${string}`;
  SSPY: `0x${string}`;
  CHAINLINK_SP500_PRICE_FEED: `0x${string}`;
  CHAINLINK_USDC_PRICE_FEED?: `0x${string}`; // Optional for chains where USDC price feed might not be directly used on this page
  ETFINITY_PROTOCOL: `0x${string}`;
}> = {
  // Arbitrum Sepolia Addresses (Chain ID: 421614)
  421614: {
    USDC: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_USDC_CONTRACT_ADDRESS as `0x${string}`,
    SSPY: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SSPY_CONTRACT_ADDRESS as `0x${string}`,
    CHAINLINK_SP500_PRICE_FEED: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`,
    CHAINLINK_USDC_PRICE_FEED: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAINLINK_USDC_PRICE_FEED_ADDRESS as `0x${string}`,
    ETFINITY_PROTOCOL: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`,
  },
  // Sepolia Addresses (Chain ID: 11155111)
  11155111: {
    USDC: process.env.NEXT_PUBLIC_SEPOLIA_USDC_CONTRACT_ADDRESS as `0x${string}`,
    SSPY: process.env.NEXT_PUBLIC_SEPOLIA_SSPY_CONTRACT_ADDRESS as `0x${string}`,
    CHAINLINK_SP500_PRICE_FEED: process.env.NEXT_PUBLIC_SEPOLIA_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`,
    CHAINLINK_USDC_PRICE_FEED: process.env.NEXT_PUBLIC_SEPOLIA_CHAINLINK_USDC_PRICE_FEED_ADDRESS as `0x${string}`,
    ETFINITY_PROTOCOL: process.env.NEXT_PUBLIC_SEPOLIA_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`,
  },
};

// Define token and Chainlink price feed decimals for accurate unit conversion.
const USDC_DECIMALS = 6;
const SSPY_DECIMALS = 18;
const CHAINLINK_PRICE_FEED_DECIMALS = 8;

const HomePage: React.FC = () => {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();

  // State variables for UI and transaction management.
  const [activeTab, setActiveTab] = useState('mint');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [selectedCollateral, setSelectedCollateral] = useState('USDC'); // Currently only USDC is supported
  const [sspyAmount, setSspyAmount] = useState('');
  const [mintError, setMintError] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<{ message: string, type: 'info' | 'success' | 'error' | null, hash?: `0x${string}` } | null>(null);

  // State to track if an approval transaction is pending before minting.
  const [pendingMintApproval, setPendingMintApproval] = useState(false);
  // Ref to store the collateral amount in Wei for minting after approval.
  const collateralAmountRef = useRef<bigint>(BigInt(0));

  // Dynamically select contract addresses based on the currently connected chain.
  const currentChainId = chain?.id;
  const currentContracts = currentChainId ? CONTRACT_ADDRESSES[currentChainId] : undefined;

  // Flag to enable/disable contract interactions if contracts for the current chain are defined.
  const contractsLoaded = !!currentContracts;

  /**
   * @dev Effect to handle unsupported network connections.
   * Displays an error message to the user if connected to an unconfigured chain.
   */
  useEffect(() => {
    if (isConnected && !currentContracts) {
      setMintError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
      setRedeemError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
    } else if (!isConnected) {
      // Clear errors when disconnected.
      setMintError("");
      setRedeemError("");
    }
  }, [currentChainId, isConnected, currentContracts]);


  // --- READ CONTRACT DATA ---

  /**
   * @dev Fetches the latest S&P 500 price from the Chainlink oracle.
   */
  const { data: sp500PriceData, isLoading: isLoadingSp500Price } = useReadContract({
    address: currentContracts?.CHAINLINK_SP500_PRICE_FEED,
    abi: chainlinkAggregatorV3Abi,
    functionName: 'latestRoundData',
    args: [],
    query: {
      enabled: contractsLoaded,
      refetchInterval: 10000, // Refetch every 10 seconds to keep price updated.
    },
  });
  const sp500PriceRaw = sp500PriceData ? (sp500PriceData[1] as bigint) : BigInt(0);
  const sp500Price = sp500PriceRaw ? parseFloat(formatUnits(sp500PriceRaw, CHAINLINK_PRICE_FEED_DECIMALS)) : 0;

  /**
   * @dev Reads the target collateralization ratio from the Etfinity Protocol contract.
   */
  const { data: collateralizationRatioRaw, isLoading: isLoadingCollateralRatio } = useReadContract({
    address: currentContracts?.ETFINITY_PROTOCOL,
    abi: etfinityProtocolAbi,
    functionName: 'TARGET_COLLATERALIZATION_RATIO',
    args: [],
    query: {
      enabled: contractsLoaded,
      refetchInterval: 10000,
    },
  });
  const collateralizationRatio = collateralizationRatioRaw ? Number(collateralizationRatioRaw) / 100 : 0;

  /**
   * @dev Fetches the connected user's USDC balance.
   */
  const { data: userUsdcBalanceRaw, isLoading: isLoadingUsdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: currentContracts?.USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && contractsLoaded,
      refetchInterval: 5000, // Refetch every 5 seconds.
    },
  });
  const userUsdcHoldings = userUsdcBalanceRaw ? parseFloat(formatUnits(userUsdcBalanceRaw, USDC_DECIMALS)) : 0;

  /**
   * @dev Fetches the connected user's sSPY balance.
   */
  const { data: userSspyBalanceRaw, isLoading: isLoadingSspyBalance, refetch: refetchSspyBalance } = useReadContract({
    address: currentContracts?.SSPY,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && contractsLoaded,
      refetchInterval: 5000,
    },
  });
  const userSspyHoldings = userSspyBalanceRaw ? parseFloat(formatUnits(userSspyBalanceRaw, SSPY_DECIMALS)) : 0;

  /**
   * @dev Fetches the USDC allowance granted to the Etfinity Protocol contract by the user.
   */
  const { data: usdcAllowanceRaw, isLoading: isLoadingUsdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: currentContracts?.USDC,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, currentContracts?.ETFINITY_PROTOCOL as `0x${string}`],
    query: {
      enabled: isConnected && !!address && contractsLoaded,
      refetchInterval: 5000,
    },
  });
  const usdcAllowance = usdcAllowanceRaw ? parseFloat(formatUnits(usdcAllowanceRaw as bigint, USDC_DECIMALS)) : 0;


  // --- CALCULATIONS ---

  /**
   * @dev Calculates the amount of sSPY that can be minted for a given collateral amount.
   * Uses the S&P 500 price and target collateralization ratio.
   */
  const calculateSspy = useCallback((amount: string): string => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || sp500Price === 0 || collateralizationRatio === 0) {
      return '';
    }
    const denominator = sp500Price * (collateralizationRatio / 100);
    if (isNaN(denominator) || denominator === 0) { return '0.0000'; }
    return (parsedAmount / denominator).toFixed(4);
  }, [sp500Price, collateralizationRatio]);

  /**
   * @dev Calculates the collateral required to redeem a given amount of sSPY.
   * Uses the S&P 500 price and target collateralization ratio.
   */
  const calculateCollateral = useCallback((amount: string): string => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || sp500Price === 0 || collateralizationRatio === 0) {
      return '';
    }
    const product = parsedAmount * sp500Price * (collateralizationRatio / 100);
    if (isNaN(product)) { return '0.00'; }
    return product.toFixed(2);
  }, [sp500Price, collateralizationRatio]);


  // --- EFFECTS FOR UI UPDATES ---

  /**
   * @dev Updates the sSPY amount field when collateral amount changes in the 'mint' tab.
   */
  useEffect(() => {
    if (activeTab === 'mint') {
      setSspyAmount(calculateSspy(collateralAmount));
    }
  }, [collateralAmount, activeTab, calculateSspy]);

  /**
   * @dev Updates the collateral amount field when sSPY amount changes in the 'redeem' tab.
   */
  useEffect(() => {
    if (activeTab === 'redeem') {
      setCollateralAmount(calculateCollateral(sspyAmount));
    }
  }, [sspyAmount, activeTab, calculateCollateral]);


  // --- WRITE CONTRACT INTERACTIONS ---

  // Wagmi hooks for USDC approval transaction.
  const {
    data: approveHash,
    writeContract: writeApprove,
    isPending: isApprovePending,
    isError: isApproveError,
    error: approveError,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    isError: isApproveReceiptError,
    error: approveReceiptError,
  } = useWaitForTransactionReceipt({ hash: approveHash });

  // Wagmi hooks for sSPY minting transaction.
  const {
    data: mintHash,
    writeContract: writeMint,
    isPending: isMintPending,
    isError: isMintError,
    error: mintErrorWagmi,
  } = useWriteContract();

  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
    isError: isMintReceiptError,
    error: mintReceiptError,
  } = useWaitForTransactionReceipt({ hash: mintHash });

  // Wagmi hooks for sSPY redemption transaction.
  const {
    data: redeemHash,
    writeContract: writeRedeem,
    isPending: isRedeemPending,
    isError: isRedeemError,
    error: redeemErrorWagmi,
  } = useWriteContract();

  const {
    isLoading: isRedeemConfirming,
    isSuccess: isRedeemConfirmed,
    isError: isRedeemReceiptError,
    error: redeemReceiptError,
  } = useWaitForTransactionReceipt({ hash: redeemHash });


  // --- Transaction Status Management ---

  /**
   * @dev Updates transaction status message when a transaction is pending wallet confirmation.
   */
  useEffect(() => {
    if (isApprovePending || isMintPending || isRedeemPending) {
      setTransactionStatus({ message: 'Waiting for wallet confirmation...', type: 'info' });
    }
  }, [isApprovePending, isMintPending, isRedeemPending]);

  /**
   * @dev Handles updates for USDC approval transaction status.
   */
  useEffect(() => {
    if (approveHash) {
      setTransactionStatus({ message: `Approval transaction sent! Hash: ${approveHash}`, type: 'info', hash: approveHash });
    }
    if (isApproveConfirming) {
      setTransactionStatus({ message: 'Confirming approval on blockchain...', type: 'info', hash: approveHash });
    }
    if (isApproveConfirmed) {
      setTransactionStatus({ message: 'Approval confirmed successfully! Proceeding with mint if applicable.', type: 'success', hash: approveHash });
      refetchUsdcAllowance(); // Refetch allowance after successful approval.

      // If minting was pending approval, proceed with mint transaction.
      if (pendingMintApproval) {
        setPendingMintApproval(false);
        setTransactionStatus({ message: 'Approval confirmed. Proceeding to mint sSPY...', type: 'info' });
        if (!currentContracts?.ETFINITY_PROTOCOL) {
          setTransactionStatus({ message: 'Protocol contract address not found for this network.', type: 'error' });
          return;
        }
        writeMint({
          address: currentContracts.ETFINITY_PROTOCOL,
          abi: etfinityProtocolAbi,
          functionName: 'mintSPY',
          args: [collateralAmountRef.current],
        });
      }
    }
    if (isApproveError) {
      setTransactionStatus({ message: `Approval failed: ${approveError?.message || 'Unknown error.'}`, type: 'error' });
      setPendingMintApproval(false);
    }
    if (isApproveReceiptError) {
      setTransactionStatus({ message: `Approval confirmation error: ${approveReceiptError?.message || 'Unknown error.'}`, type: 'error' });
    }
  }, [approveHash, isApprovePending, isApproveConfirming, isApproveConfirmed, isApproveError, approveError, isApproveReceiptError, approveReceiptError, refetchUsdcAllowance, pendingMintApproval, writeMint, currentContracts]);

  /**
   * @dev Handles updates for sSPY minting transaction status.
   */
  useEffect(() => {
    if (mintHash) {
      setTransactionStatus({ message: `Mint transaction sent! Hash: ${mintHash}`, type: 'info', hash: mintHash });
    }
    if (isMintConfirming) {
      setTransactionStatus({ message: 'Confirming mint on blockchain...', type: 'info', hash: mintHash });
    }
    if (isMintConfirmed) {
      setTransactionStatus({ message: 'Mint confirmed successfully!', type: 'success', hash: mintHash });
      refetchUsdcBalance(); // Update USDC balance.
      refetchSspyBalance(); // Update sSPY balance.
      setCollateralAmount(''); // Clear input fields.
      setSspyAmount('');
      router.push('/dashboard'); // Navigate to dashboard after successful mint.
    }
    if (isMintError) {
      setTransactionStatus({ message: `Mint failed: ${mintErrorWagmi?.message || 'Unknown error.'}`, type: 'error' });
    }
    if (isMintReceiptError) {
      setTransactionStatus({ message: `Mint confirmation error: ${mintReceiptError?.message || 'Unknown error.'}`, type: 'error' });
    }
  }, [mintHash, isMintPending, isMintConfirming, isMintConfirmed, isMintError, mintErrorWagmi, isMintReceiptError, mintReceiptError, refetchUsdcBalance, refetchSspyBalance, router]);

  /**
   * @dev Handles updates for sSPY redemption transaction status.
   */
  useEffect(() => {
    if (redeemHash) {
      setTransactionStatus({ message: `Redeem transaction sent! Hash: ${redeemHash}`, type: 'info', hash: redeemHash });
    }
    if (isRedeemConfirming) {
      setTransactionStatus({ message: 'Confirming redeem on blockchain...', type: 'info', hash: redeemHash });
    }
    if (isRedeemConfirmed) {
      setTransactionStatus({ message: 'Redeem confirmed successfully!', type: 'success', hash: redeemHash });
      refetchUsdcBalance(); // Update USDC balance.
      refetchSspyBalance(); // Update sSPY balance.
      setCollateralAmount(''); // Clear input fields.
      setSspyAmount('');
    }
    if (isRedeemError) {
      setTransactionStatus({ message: `Redeem failed: ${redeemErrorWagmi?.message || 'Unknown error.'}`, type: 'error' });
    }
    if (isRedeemReceiptError) {
      setTransactionStatus({ message: `Redeem confirmation error: ${redeemReceiptError?.message || 'Unknown error.'}`, type: 'error' });
    }
  }, [redeemHash, isRedeemPending, isRedeemConfirming, isRedeemConfirmed, isRedeemError, redeemErrorWagmi, isRedeemReceiptError, redeemReceiptError, refetchUsdcBalance, refetchSspyBalance]);


  // --- HANDLERS FOR MINT/REDEEM ACTIONS ---

  /**
   * @dev Handles the minting process, including USDC approval if necessary.
   */
  const handleMint = async () => {
    setMintError('');
    setTransactionStatus(null);
    if (!isConnected) {
      setMintError("Please connect your wallet to mint.");
      return;
    }
    if (!contractsLoaded) {
      setMintError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
      return;
    }

    const collateralInputFloat = parseFloat(collateralAmount || '0');
    if (!collateralInputFloat || collateralInputFloat <= 0) {
      setMintError("Please enter a valid collateral amount to mint.");
      return;
    }
    if (collateralInputFloat > userUsdcHoldings) {
      setMintError("You do not have enough USDC collateral.");
      return;
    }

    const collateralAmountWei = parseUnits(collateralInputFloat.toString(), USDC_DECIMALS);
    // Store the amount in ref for potential subsequent mint after approval.
    collateralAmountRef.current = collateralAmountWei;

    // Check if approval is needed before minting.
    if (collateralInputFloat > usdcAllowance) {
      try {
        setPendingMintApproval(true);
        setTransactionStatus({ message: 'Approving USDC for protocol (check wallet)...', type: 'info' });
        await writeApprove({
          address: currentContracts?.USDC,
          abi: erc20Abi,
          functionName: 'approve',
          args: [currentContracts?.ETFINITY_PROTOCOL as `0x${string}`, maxUint256], // Approve maximum amount for convenience.
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during approval initiation.';
        setMintError(`Approval failed: ${errorMessage}`);
        setTransactionStatus({ message: `Approval failed: ${errorMessage}`, type: 'error' });
        setPendingMintApproval(false);
      }
      return;
    }

    // Proceed with minting if approval is sufficient or not needed.
    try {
      setTransactionStatus({ message: 'Sending mint transaction (check wallet)...', type: 'info' });
      await writeMint({
        address: currentContracts?.ETFINITY_PROTOCOL,
        abi: etfinityProtocolAbi,
        functionName: 'mintSPY',
        args: [collateralAmountWei],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during mint initiation.';
      setMintError(`Mint transaction failed: ${errorMessage}`);
      setTransactionStatus({ message: `Mint transaction failed: ${errorMessage}`, type: 'error' });
    }
  };

  /**
   * @dev Handles the sSPY redemption process.
   */
  const handleRedeem = async () => {
    setRedeemError('');
    setTransactionStatus(null);
    if (!isConnected) {
      setRedeemError("Please connect your wallet to redeem.");
      return;
    }
    if (!contractsLoaded) {
      setRedeemError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
      return;
    }

    const sspyInputFloat = parseFloat(sspyAmount || '0');
    if (!sspyInputFloat || sspyInputFloat <= 0) {
      setRedeemError("Please enter a valid amount of sSPY to redeem.");
      return;
    }
    if (sspyInputFloat > userSspyHoldings) {
      setRedeemError("You do not have enough sSPY to redeem.");
      return;
    }

    const sspyAmountWei = parseUnits(sspyInputFloat.toString(), SSPY_DECIMALS);

    try {
      setTransactionStatus({ message: 'Sending redeem transaction (check wallet)...', type: 'info' });
      await writeRedeem({
        address: currentContracts?.ETFINITY_PROTOCOL,
        abi: etfinityProtocolAbi,
        functionName: 'redeemSPY',
        args: [sspyAmountWei],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during redeem initiation.';
      setRedeemError(`Redeem transaction failed: ${errorMessage}`);
      setTransactionStatus({ message: `Redeem transaction failed: ${errorMessage}`, type: 'error' });
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="text-center py-16 px-6 md:py-24">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
          Synthetic ETFs in Your wallet
          <span className="text-purple-400 block mt-2">No brokers, No banks.</span>
        </h2>
        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-8">
          Access a growing range of synthetic assets, starting with sSPY, directly from your crypto wallet.
          Experience true ownership and decentralized finance.
        </p>
        {/* Connect button for disconnected state */}
        {!isConnected && (
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {!connected && (
                    <button
                      onClick={openConnectModal}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-lg shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-75"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        )}
      </section>

      {/* Main Dapp Interface (Mint/Redeem) */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700">
          {/* Tab navigation for Mint/Redeem */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setActiveTab('mint'); setMintError(''); setTransactionStatus(null); }}
              className={`px-6 py-3 rounded-l-xl text-lg font-semibold transition-all duration-300 ${
                activeTab === 'mint'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Mint sSPY
            </button>
            <button
              onClick={() => { setActiveTab('redeem'); setRedeemError(''); setTransactionStatus(null); }}
              className={`px-6 py-3 rounded-r-xl text-lg font-semibold transition-all duration-300 ${
                activeTab === 'redeem'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Redeem sSPY
            </button>
          </div>

          {/* Protocol Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-zinc-700 p-4 rounded-xl shadow-inner flex flex-col items-center justify-center">
              <BarChart3 size={24} className="text-purple-400 mb-2" />
              <p className="text-zinc-300 text-sm">S&P 500 Price (Chainlink)</p>
              <p className="text-xl font-bold text-white">
                {isLoadingSp500Price && contractsLoaded ? 'Loading...' : `$${sp500Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className="bg-zinc-700 p-4 rounded-xl shadow-inner flex flex-col items-center justify-center">
              <DollarSign size={24} className="text-green-400 mb-2" />
              <p className="text-zinc-300 text-sm">Target Collateralization</p>
              <p className="text-xl font-bold text-white">
                {isLoadingCollateralRatio && contractsLoaded ? 'Loading...' : `${collateralizationRatio}%`}
              </p>
            </div>
          </div>

          {/* Mint sSPY Tab Content */}
          {activeTab === 'mint' && (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="collateral-input" className="block text-zinc-300 text-sm font-medium mb-2">
                  Collateral Amount ({selectedCollateral})
                </label>
                <input
                  type="number"
                  id="collateral-input"
                  placeholder="0.00"
                  value={collateralAmount}
                  onChange={(e) => {
                    setCollateralAmount(e.target.value);
                    setMintError('');
                    setTransactionStatus(null);
                  }}
                  className="w-full p-3 pr-24 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center top-8">
                  <select
                    value={selectedCollateral}
                    onChange={(e) => setSelectedCollateral(e.target.value)}
                    className="bg-zinc-600 text-white rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>

              <div className="text-center text-zinc-400 font-semibold text-lg">
                <ArrowRightLeft size={24} className="inline-block text-purple-400" />
              </div>

              <div className="relative">
                <label htmlFor="sspy-output" className="block text-zinc-300 text-sm font-medium mb-2">
                  You will mint (sSPY)
                </label>
                <input
                  type="text"
                  id="sspy-output"
                  value={sspyAmount}
                  readOnly
                  className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">sSPY</span>
              </div>

              <button
                onClick={handleMint}
                disabled={
                  !isConnected ||
                  !contractsLoaded ||
                  !collateralAmount ||
                  parseFloat(collateralAmount || '0') <= 0 ||
                  parseFloat(collateralAmount || '0') > userUsdcHoldings ||
                  isApprovePending || isApproveConfirming ||
                  isMintPending || isMintConfirming
                }
                title={!isConnected ? "Connect wallet" : (!contractsLoaded ? "Unsupported network" : "")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg shadow-xl transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isApprovePending || isApproveConfirming) ? 'Approving...' :
                 (isMintPending || isMintConfirming) ? 'Minting...' :
                 'Mint sSPY'}
              </button>
              {mintError && (
                <p className="text-red-400 text-sm mt-2 text-center">{mintError}</p>
              )}
              <p className="text-zinc-400 text-sm text-center">
                Your USDC: {isConnected && !isLoadingUsdcBalance && contractsLoaded ? `$${userUsdcHoldings.toFixed(2)}` : 'Connect Wallet / Unsupported Network'}
              </p>
              <p className="text-zinc-400 text-sm text-center">
                USDC Allowance: {isConnected && !isLoadingUsdcAllowance && contractsLoaded ? `$${usdcAllowance.toFixed(2)}` : 'N/A'}
              </p>
            </div>
          )}

          {/* Redeem sSPY Tab Content */}
          {activeTab === 'redeem' && (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="sspy-input-redeem" className="block text-zinc-300 text-sm font-medium mb-2">
                  sSPY to Redeem
                </label>
                <input
                  type="number"
                  id="sspy-input-redeem"
                  placeholder="0.00"
                  value={sspyAmount}
                  onChange={(e) => {
                    setSspyAmount(e.target.value);
                    setCollateralAmount(calculateCollateral(e.target.value));
                    setRedeemError('');
                    setTransactionStatus(null);
                  }}
                  className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">sSPY</span>
              </div>

              <div className="text-center text-zinc-400 font-semibold text-lg">
                <ArrowRightLeft size={24} className="inline-block text-purple-400" />
              </div>

              <div className="relative">
                <label htmlFor="collateral-output-redeem" className="block text-zinc-300 text-sm font-medium mb-2">
                  You will receive ({selectedCollateral})
                </label>
                <input
                  type="text"
                  id="collateral-output-redeem"
                  value={collateralAmount}
                  readOnly
                  className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">{selectedCollateral}</span>
              </div>

              <button
                onClick={handleRedeem}
                disabled={
                  !isConnected ||
                  !contractsLoaded ||
                  !sspyAmount ||
                  parseFloat(sspyAmount || '0') <= 0 ||
                  parseFloat(sspyAmount || '0') > userSspyHoldings ||
                  isRedeemPending || isRedeemConfirming
                }
                title={!isConnected ? "Connect wallet" : (!contractsLoaded ? "Unsupported network" : "")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isRedeemPending || isRedeemConfirming) ? 'Redeeming...' : 'Redeem sSPY'}
              </button>
              {redeemError && (
                <p className="text-red-400 text-sm mt-2 text-center">{redeemError}</p>
              )}
              <p className="text-zinc-400 text-sm text-center">
                Your sSPY: {isConnected && !isLoadingSspyBalance && contractsLoaded ? userSspyHoldings.toFixed(4) : 'Connect Wallet / Unsupported Network'}
              </p>
            </div>
          )}

          {/* Transaction Status Message */}
          {transactionStatus && (
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-lg text-sm text-center shadow-lg z-50 ${
              transactionStatus.type === 'info' ? 'bg-blue-900 text-blue-200' :
              transactionStatus.type === 'success' ? 'bg-green-900 text-green-200' :
              transactionStatus.type === 'error' ? 'bg-red-900 text-red-200' : 'bg-zinc-700 text-zinc-300'
            }`}>
              <p>{transactionStatus.message}</p>
              {transactionStatus.hash && chain?.blockExplorers?.etherscan?.url && (
                <a
                  href={`${chain.blockExplorers.etherscan.url}/tx/${transactionStatus.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-purple-300 hover:underline"
                >
                  View Transaction on {chain.blockExplorers.etherscan.name || 'Explorer'}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomePage;
