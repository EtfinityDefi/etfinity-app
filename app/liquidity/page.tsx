'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';

// Import ABIs
import { erc20Abi } from '../../contracts/abi/Erc20Abi';
import { chainlinkAggregatorV3Abi } from '../../contracts/abi/ChainlinkAggregatorV3Abi';
import { etfinityProtocolAbi } from '../../contracts/abi/EtfinityProtocolAbi';

/**
 * @dev Defines all contract addresses per network.
 * These values are loaded from environment variables (e.g., .env.local).
 */
const CONTRACT_ADDRESSES: Record<number, {
  USDC: `0x${string}`;
  SSPY: `0x${string}`;
  CHAINLINK_SP500_PRICE_FEED: `0x${string}`;
  ETFINITY_PROTOCOL: `0x${string}`;
}> = {
  // Arbitrum Sepolia Addresses (Chain ID: 421614)
  421614: {
    USDC: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_USDC_CONTRACT_ADDRESS as `0x${string}`,
    SSPY: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SSPY_CONTRACT_ADDRESS as `0x${string}`,
    CHAINLINK_SP500_PRICE_FEED: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`,
    ETFINITY_PROTOCOL: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`,
  },
  // Sepolia Addresses (Chain ID: 11155111)
  11155111: {
    USDC: process.env.NEXT_PUBLIC_SEPOLIA_USDC_CONTRACT_ADDRESS as `0x${string}`,
    SSPY: process.env.NEXT_PUBLIC_SEPOLIA_SSPY_CONTRACT_ADDRESS as `0x${string}`,
    CHAINLINK_SP500_PRICE_FEED: process.env.NEXT_PUBLIC_SEPOLIA_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`,
    ETFINITY_PROTOCOL: process.env.NEXT_PUBLIC_SEPOLIA_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`,
  },
};

// Define token and price feed decimals
const USDC_DECIMALS = 6;
const SSPY_DECIMALS = 18;
const CHAINLINK_PRICE_FEED_DECIMALS = 8;

const LiquidityPage: React.FC = () => {
  const { address, isConnected, chain } = useAccount();

  // UI State
  const [sspyAmountToAdd, setSspyAmountToAdd] = useState<string>('');
  const [usdcAmountToAdd, setUsdcAmountToAdd] = useState<string>('');
  const [removeLpAmount, setRemoveLpAmount] = useState<string>('');
  const [addLpError, setAddLpError] = useState<string>('');
  const [removeLpError, setRemoveLpError] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<{ message: string, type: 'info' | 'success' | 'error' | null, hash?: `0x${string}` } | null>(null);

  // State for chaining transactions (approvals before adding liquidity)
  const [pendingUsdcApprovalForLp, setPendingUsdcApprovalForLp] = useState(false);
  const [pendingSspyApprovalForLp, setPendingSspyApprovalForLp] = useState(false);
  const storedLpAmounts = useRef<{ sspy: bigint, usdc: bigint }>({ sspy: BigInt(0), usdc: BigInt(0) });

  // Local State for LP Holdings Value (simulated for display)
  const [userLpHoldingsValue, setUserLpHoldingsValue] = useState<number>(0);

  // Dynamically select contract addresses based on connected chain
  const currentChainId = chain?.id;
  const currentContracts = currentChainId ? CONTRACT_ADDRESSES[currentChainId] : undefined;

  // Flag to enable/disable contract interactions
  const contractsLoaded = !!currentContracts;

  // Provide a warning/error if contracts for the current chain are not found
  useEffect(() => {
    if (isConnected && !currentContracts) {
      console.warn(`No contract addresses defined for chain ID: ${currentChainId}. Please connect to a supported testnet (Sepolia or Arbitrum Sepolia).`);
      setAddLpError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
      setRemoveLpError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
    } else if (!isConnected) {
      // Clear errors if disconnected
      setAddLpError("");
      setRemoveLpError("");
    }
  }, [currentChainId, isConnected, currentContracts]);


  // --- READ CONTRACT DATA ---

  // 1. Read S&P 500 Price from Chainlink
  const { data: sp500PriceData } = useReadContract({
    address: currentContracts?.CHAINLINK_SP500_PRICE_FEED,
    abi: chainlinkAggregatorV3Abi,
    functionName: 'latestRoundData',
    args: [],
    query: {
      enabled: contractsLoaded,
      refetchInterval: 10000,
    },
  });
  const sp500PriceRaw = sp500PriceData ? (sp500PriceData[1] as bigint) : BigInt(0);
  const currentSp500Price = sp500PriceRaw ? parseFloat(formatUnits(sp500PriceRaw, CHAINLINK_PRICE_FEED_DECIMALS)) : 0;

  // 2. Read User USDC Balance
  const { data: userUsdcBalanceRaw, isLoading: isLoadingUsdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: currentContracts?.USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && contractsLoaded,
      refetchInterval: 5000,
    },
  });
  const userUsdcHoldings = userUsdcBalanceRaw ? parseFloat(formatUnits(userUsdcBalanceRaw, USDC_DECIMALS)) : 0;

  // 3. Read User sSPY Balance
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

  // 4. Read USDC Allowance for Protocol Contract
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

  // 5. Read sSPY Allowance for Protocol Contract
  const { data: sspyAllowanceRaw, isLoading: isLoadingSspyAllowance, refetch: refetchSspyAllowance } = useReadContract({
    address: currentContracts?.SSPY,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, currentContracts?.ETFINITY_PROTOCOL as `0x${string}`],
    query: {
      enabled: isConnected && !!address && contractsLoaded,
      refetchInterval: 5000,
    },
  });
  const sspyAllowance = sspyAllowanceRaw ? parseFloat(formatUnits(sspyAllowanceRaw as bigint, SSPY_DECIMALS)) : 0;


  // --- CALCULATIONS ---
  const handleSspyAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSspyAmountToAdd(value);
    setAddLpError('');
    setTransactionStatus(null);
    if (value && !isNaN(parseFloat(value)) && currentSp500Price > 0) {
      setUsdcAmountToAdd((parseFloat(value) * currentSp500Price).toFixed(2));
    } else {
      setUsdcAmountToAdd('');
    }
  };

  const handleUsdcAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsdcAmountToAdd(value);
    setAddLpError('');
    setTransactionStatus(null);
    if (value && !isNaN(parseFloat(value)) && currentSp500Price > 0) {
      setSspyAmountToAdd(currentSp500Price > 0 ? (parseFloat(value) / currentSp500Price).toFixed(4) : '');
    } else {
      setSspyAmountToAdd('');
    }
  };


  // --- WRITE CONTRACT INTERACTIONS ---

  // 1. USDC Approve for Add Liquidity
  const {
    data: usdcApproveHash,
    writeContract: writeUsdcApprove,
    isPending: isUsdcApprovePending,
    isError: isUsdcApproveError,
    error: usdcApproveError,
  } = useWriteContract();

  const {
    isLoading: isUsdcApproveConfirming,
    isSuccess: isUsdcApproveConfirmed,
    isError: isUsdcApproveReceiptError,
    error: usdcApproveReceiptError,
  } = useWaitForTransactionReceipt({ hash: usdcApproveHash });

  // 2. sSPY Approve for Add Liquidity
  const {
    data: sspyApproveHash,
    writeContract: writeSspyApprove,
    isPending: isSspyApprovePending,
    isError: isSspyApproveError,
    error: sspyApproveError,
  } = useWriteContract();

  const {
    isLoading: isSspyApproveConfirming,
    isSuccess: isSspyApproveConfirmed,
    isError: isSspyApproveReceiptError,
    error: sspyApproveReceiptError,
  } = useWaitForTransactionReceipt({ hash: sspyApproveHash });

  // 3. Add Liquidity Transaction
  const {
    data: addLpHash,
    writeContract: writeAddLiquidity,
    isPending: isAddLpPending,
    isError: isAddLpErrorWagmi,
    error: addLpErrorWagmi,
  } = useWriteContract();

  const {
    isLoading: isAddLpConfirming,
    isSuccess: isAddLpConfirmed,
    isError: isAddLpReceiptError,
    error: addLpReceiptError,
  } = useWaitForTransactionReceipt({ hash: addLpHash });

  // 4. Remove Liquidity Transaction
  const {
    data: removeLpHash,
    writeContract: writeRemoveLiquidity,
    isPending: isRemoveLpPending,
    isError: isRemoveLpErrorWagmi,
    error: removeLpErrorWagmi,
  } = useWriteContract();

  const {
    isLoading: isRemoveLpConfirming,
    isSuccess: isRemoveLpConfirmed,
    isError: isRemoveLpReceiptError,
    error: removeLpReceiptError,
  } = useWaitForTransactionReceipt({ hash: removeLpHash });


  // --- Transaction Status Management & Chaining ---
  useEffect(() => {
    if (isUsdcApprovePending || isSspyApprovePending || isAddLpPending || isRemoveLpPending) {
      setTransactionStatus({ message: 'Waiting for wallet confirmation...', type: 'info' });
    }
  }, [isUsdcApprovePending, isSspyApprovePending, isAddLpPending, isRemoveLpPending]);

  useEffect(() => {
    if (usdcApproveHash) {
      setTransactionStatus({ message: `USDC Approval sent! Hash: ${usdcApproveHash}`, type: 'info', hash: usdcApproveHash });
    }
    if (isUsdcApproveConfirming) {
      setTransactionStatus({ message: 'Confirming USDC approval on blockchain...', type: 'info', hash: usdcApproveHash });
    }
    if (isUsdcApproveConfirmed) {
      setTransactionStatus({ message: 'USDC Approval confirmed!', type: 'success', hash: usdcApproveHash });
      refetchUsdcAllowance();

      if (pendingUsdcApprovalForLp) {
        setPendingUsdcApprovalForLp(false);

        const sspy = parseFloat(sspyAmountToAdd || '0');

        if (sspy > sspyAllowance) {
          setPendingSspyApprovalForLp(true);
          setTransactionStatus({ message: 'USDC approved. Now approving sSPY for liquidity pool (check wallet)...', type: 'info' });
          if (!currentContracts?.SSPY) {
            setAddLpError("sSPY contract address is not defined for the current network.");
            setPendingSspyApprovalForLp(false);
            return;
          }
          writeSspyApprove({
            address: currentContracts.SSPY,
            abi: erc20Abi,
            functionName: 'approve',
            args: [currentContracts.ETFINITY_PROTOCOL as `0x${string}`, maxUint256],
          });
        } else {
          setTransactionStatus({ message: 'USDC approved. Proceeding to add liquidity (check wallet)...', type: 'info' });
          if (!currentContracts?.ETFINITY_PROTOCOL) {
              setAddLpError("ETFINITY_PROTOCOL contract address is not defined for the current network.");
              return;
          }
          writeAddLiquidity({
              address: currentContracts.ETFINITY_PROTOCOL,
              abi: etfinityProtocolAbi,
              functionName: 'addLiquidity',
              args: [storedLpAmounts.current.sspy, storedLpAmounts.current.usdc],
          });
        }
      }
    }
    if (isUsdcApproveError) {
      const errorMessage = usdcApproveError instanceof Error ? usdcApproveError.message : 'Unknown error.';
      setTransactionStatus({ message: `USDC Approval failed: ${errorMessage}`, type: 'error' });
      setPendingUsdcApprovalForLp(false);
    }
    if (isUsdcApproveReceiptError) {
      const errorMessage = usdcApproveReceiptError instanceof Error ? usdcApproveReceiptError.message : 'Unknown error.';
      setTransactionStatus({ message: `USDC Approval confirmation error: ${errorMessage}`, type: 'error' });
      setPendingUsdcApprovalForLp(false);
    }
  }, [usdcApproveHash, isUsdcApprovePending, isUsdcApproveConfirming, isUsdcApproveConfirmed, isUsdcApproveError, usdcApproveError, isUsdcApproveReceiptError, usdcApproveReceiptError, refetchUsdcAllowance, pendingUsdcApprovalForLp, sspyAmountToAdd, sspyAllowance, writeSspyApprove, writeAddLiquidity, storedLpAmounts, currentContracts]);

  useEffect(() => {
    if (sspyApproveHash) {
      setTransactionStatus({ message: `sSPY Approval sent! Hash: ${sspyApproveHash}`, type: 'info', hash: sspyApproveHash });
    }
    if (isSspyApproveConfirming) {
      setTransactionStatus({ message: 'Confirming sSPY approval on blockchain...', type: 'info', hash: sspyApproveHash });
    }
    if (isSspyApproveConfirmed) {
      setTransactionStatus({ message: 'sSPY Approval confirmed! Proceeding to add liquidity.', type: 'success', hash: sspyApproveHash });
      refetchSspyAllowance();

      if (pendingSspyApprovalForLp) {
        setPendingSspyApprovalForLp(false);
        setTransactionStatus({ message: 'sSPY approved. Proceeding to add liquidity (check wallet)...', type: 'info' });
        if (!currentContracts?.ETFINITY_PROTOCOL) {
          setAddLpError("ETFINITY_PROTOCOL contract address is not defined for the current network.");
          return;
        }
        writeAddLiquidity({
          address: currentContracts.ETFINITY_PROTOCOL,
          abi: etfinityProtocolAbi,
          functionName: 'addLiquidity',
          args: [storedLpAmounts.current.sspy, storedLpAmounts.current.usdc],
        });
      }
    }
    if (isSspyApproveError) {
      const errorMessage = sspyApproveError instanceof Error ? sspyApproveError.message : 'Unknown error.';
      setTransactionStatus({ message: `sSPY Approval failed: ${errorMessage}`, type: 'error' });
      setPendingSspyApprovalForLp(false);
    }
    if (isSspyApproveReceiptError) {
      const errorMessage = sspyApproveReceiptError instanceof Error ? sspyApproveReceiptError.message : 'Unknown error.';
      setTransactionStatus({ message: `sSPY Approval confirmation error: ${errorMessage}`, type: 'error' });
      setPendingSspyApprovalForLp(false);
    }
  }, [sspyApproveHash, isSspyApprovePending, isSspyApproveConfirming, isSspyApproveConfirmed, isSspyApproveError, sspyApproveError, isSspyApproveReceiptError, sspyApproveReceiptError, refetchSspyAllowance, pendingSspyApprovalForLp, writeAddLiquidity, storedLpAmounts, currentContracts]);


  useEffect(() => {
    if (addLpHash) {
      setTransactionStatus({ message: `Add Liquidity transaction sent! Hash: ${addLpHash}`, type: 'info', hash: addLpHash });
    }
    if (isAddLpConfirming) {
      setTransactionStatus({ message: 'Confirming Add Liquidity on blockchain...', type: 'info', hash: addLpHash });
    }
    if (isAddLpConfirmed) {
      setTransactionStatus({ message: 'Liquidity added successfully!', type: 'success', hash: addLpHash });
      refetchUsdcBalance();
      refetchSspyBalance();
      refetchUsdcAllowance();
      refetchSspyAllowance();
      const sspy = parseFloat(sspyAmountToAdd || '0');
      const usdc = parseFloat(usdcAmountToAdd || '0');
      const valueAddedToLP = (sspy * currentSp500Price) + usdc;
      setUserLpHoldingsValue(prev => prev + valueAddedToLP);
      setSspyAmountToAdd('');
      setUsdcAmountToAdd('');
    }
    if (isAddLpErrorWagmi) {
      const errorMessage = addLpErrorWagmi instanceof Error ? addLpErrorWagmi.message : 'Unknown error.';
      setTransactionStatus({ message: `Add Liquidity failed: ${errorMessage}`, type: 'error' });
    }
    if (isAddLpReceiptError) {
      const errorMessage = addLpReceiptError instanceof Error ? addLpReceiptError.message : 'Unknown error.';
      setTransactionStatus({ message: `Add Liquidity confirmation error: ${errorMessage}`, type: 'error' });
    }
  }, [addLpHash, isAddLpPending, isAddLpConfirming, isAddLpConfirmed, isAddLpErrorWagmi, addLpErrorWagmi, isAddLpReceiptError, addLpReceiptError, refetchUsdcBalance, refetchSspyBalance, refetchUsdcAllowance, refetchSspyAllowance, sspyAmountToAdd, usdcAmountToAdd, currentSp500Price]);

  useEffect(() => {
    if (removeLpHash) {
      setTransactionStatus({ message: `Remove Liquidity transaction sent! Hash: ${removeLpHash}`, type: 'info', hash: removeLpHash });
    }
    if (isRemoveLpConfirming) {
      setTransactionStatus({ message: 'Confirming Remove Liquidity on blockchain...', type: 'info', hash: removeLpHash });
    }
    if (isRemoveLpConfirmed) {
      setTransactionStatus({ message: 'Liquidity removed successfully!', type: 'success', hash: removeLpHash });
      refetchUsdcBalance();
      refetchSspyBalance();
      refetchUsdcAllowance();
      refetchSspyAllowance();
      const amount = parseFloat(removeLpAmount || '0');
      setUserLpHoldingsValue(prevValue => prevValue - amount);
      setRemoveLpAmount('');
    }
    if (isRemoveLpErrorWagmi) {
      const errorMessage = removeLpErrorWagmi instanceof Error ? removeLpErrorWagmi.message : 'Unknown error.';
      setTransactionStatus({ message: `Remove Liquidity failed: ${errorMessage}`, type: 'error' });
    }
    if (isRemoveLpReceiptError) {
      const errorMessage = removeLpReceiptError instanceof Error ? removeLpReceiptError.message : 'Unknown error.';
      setTransactionStatus({ message: `Remove Liquidity confirmation error: ${errorMessage}`, type: 'error' });
    }
  }, [removeLpHash, isRemoveLpPending, isRemoveLpConfirming, isRemoveLpConfirmed, isRemoveLpErrorWagmi, removeLpErrorWagmi, isRemoveLpReceiptError, removeLpReceiptError, refetchUsdcBalance, refetchSspyBalance, refetchUsdcAllowance, refetchSspyAllowance, removeLpAmount]);


  // --- HANDLERS FOR LIQUIDITY ACTIONS ---

  const handleAddLiquidity = async () => {
    setAddLpError('');
    setTransactionStatus(null);
    if (!isConnected) {
      setAddLpError("Please connect your wallet to add liquidity.");
      return;
    }
    if (!contractsLoaded) {
      setAddLpError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
      return;
    }

    const sspy = parseFloat(sspyAmountToAdd || '0');
    const usdc = parseFloat(usdcAmountToAdd || '0');

    if (isNaN(sspy) || sspy <= 0 || isNaN(usdc) || usdc <= 0) {
      setAddLpError("Please enter valid amounts for sSPY and USDC.");
      return;
    }
    if (sspy > userSspyHoldings) {
      setAddLpError("You do not have enough sSPY.");
      return;
    }
    if (usdc > userUsdcHoldings) {
      setAddLpError("You do not have enough USDC.");
      return;
    }

    const sspyAmountWei = parseUnits(sspy.toString(), SSPY_DECIMALS);
    const usdcAmountWei = parseUnits(usdc.toString(), USDC_DECIMALS);
    storedLpAmounts.current = { sspy: sspyAmountWei, usdc: usdcAmountWei };

    if (usdc > usdcAllowance) {
      try {
        setPendingUsdcApprovalForLp(true);
        setTransactionStatus({ message: 'Approving USDC for liquidity pool (check wallet)...', type: 'info' });
        await writeUsdcApprove({
          address: currentContracts?.USDC,
          abi: erc20Abi,
          functionName: 'approve',
          args: [currentContracts?.ETFINITY_PROTOCOL as `0x${string}`, maxUint256],
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during approval initiation.';
        setAddLpError(`USDC Approval failed: ${errorMessage}`);
        setTransactionStatus({ message: `USDC Approval failed: ${errorMessage}`, type: 'error' });
        setPendingUsdcApprovalForLp(false);
      }
      return;
    }

    if (sspy > sspyAllowance) {
      try {
        setPendingSspyApprovalForLp(true);
        setTransactionStatus({ message: 'Approving sSPY for liquidity pool (check wallet)...', type: 'info' });
        if (!currentContracts?.SSPY) {
          setAddLpError("sSPY contract address is not defined for the current network.");
          setPendingSspyApprovalForLp(false);
          return;
        }
        await writeSspyApprove({
          address: currentContracts.SSPY,
          abi: erc20Abi,
          functionName: 'approve',
          args: [currentContracts.ETFINITY_PROTOCOL as `0x${string}`, maxUint256],
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during approval initiation.';
        setAddLpError(`sSPY Approval failed: ${errorMessage}`);
        setTransactionStatus({ message: `sSPY Approval failed: ${errorMessage}`, type: 'error' });
        setPendingSspyApprovalForLp(false);
      }
      return;
    }

    try {
      setTransactionStatus({ message: 'Sending Add Liquidity transaction (check wallet)...', type: 'info' });
      await writeAddLiquidity({
        address: currentContracts?.ETFINITY_PROTOCOL,
        abi: etfinityProtocolAbi,
        functionName: 'addLiquidity',
        args: [storedLpAmounts.current.sspy, storedLpAmounts.current.usdc],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during add liquidity initiation.';
      setAddLpError(`Add Liquidity failed: ${errorMessage}`);
      setTransactionStatus({ message: `Add Liquidity failed: ${errorMessage}`, type: 'error' });
    }
  };

  const handleRemoveLiquidity = async () => {
    setRemoveLpError('');
    setTransactionStatus(null);
    if (!isConnected) {
      setRemoveLpError("Please connect your wallet to remove liquidity.");
      return;
    }
    if (!contractsLoaded) {
      setRemoveLpError("Unsupported network. Please connect to Sepolia or Arbitrum Sepolia.");
      return;
    }

    const amount = parseFloat(removeLpAmount || '0');
    if (isNaN(amount) || amount <= 0) {
      setRemoveLpError("Please enter a valid amount to remove from LP.");
      return;
    }
    if (amount > userLpHoldingsValue) {
      setRemoveLpError("Amount to remove exceeds your current LP value.");
      return;
    }
    if (currentSp500Price === 0) {
        setRemoveLpError("Market price is zero, cannot remove liquidity.");
        return;
    }

    const lpTokensToBurn = parseUnits(amount.toString(), SSPY_DECIMALS); // Using SSPY_DECIMALS as a placeholder for LP token decimals
    try {
      setTransactionStatus({ message: 'Sending Remove Liquidity transaction (check wallet)...', type: 'info' });
      await writeRemoveLiquidity({
        address: currentContracts?.ETFINITY_PROTOCOL,
        abi: etfinityProtocolAbi,
        functionName: 'removeLiquidity',
        args: [lpTokensToBurn],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during remove liquidity initiation.';
      setRemoveLpError(`Remove Liquidity failed: ${errorMessage}`);
      setTransactionStatus({ message: `Remove Liquidity failed: ${errorMessage}`, type: 'error' });
    }
  };


  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Liquidity Pool</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 flex flex-col">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
            <ArrowUpCircle size={28} className="mr-3 text-purple-400" /> Add Liquidity
          </h3>
          <p className="text-zinc-300 text-sm mb-6 text-center">Provide sSPY and USDC to the liquidity pool to earn trading fees (APR: 12.3%).</p>

          <div className="space-y-5 flex-grow">
            <div className="relative">
              <label htmlFor="sspy-add-lp" className="block text-zinc-300 text-sm font-medium mb-2">
                sSPY Amount
              </label>
              <input
                type="number"
                id="sspy-add-lp"
                placeholder="0.00"
                value={sspyAmountToAdd}
                onChange={handleSspyAddChange}
                className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">sSPY</span>
            </div>

            <div className="relative">
              <label htmlFor="usdc-add-lp" className="block text-zinc-300 text-sm font-medium mb-2">
                USDC Amount
              </label>
              <input
                type="number"
                id="usdc-add-lp"
                placeholder="0.00"
                value={usdcAmountToAdd}
                onChange={handleUsdcAddChange}
                className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">USDC</span>
            </div>
            <p className="text-zinc-400 text-sm mt-2 font-semibold text-center">
              Your sSPY: <span className="text-white">{isConnected && !isLoadingSspyBalance && contractsLoaded ? userSspyHoldings.toFixed(4) : 'Connect Wallet / Unsupported Network'}</span> | Your USDC: <span className="text-white">${isConnected && !isLoadingUsdcBalance && contractsLoaded ? userUsdcHoldings.toFixed(2) : 'Connect Wallet / Unsupported Network'}</span>
            </p>
            <p className="text-zinc-400 text-sm mt-2 font-semibold text-center">
              USDC Allowance: <span className="text-white">${isConnected && !isLoadingUsdcAllowance && contractsLoaded ? usdcAllowance.toFixed(2) : 'N/A'}</span> | sSPY Allowance: <span className="text-white">{isConnected && !isLoadingSspyAllowance && contractsLoaded ? sspyAllowance.toFixed(4) : 'N/A'}</span>
            </p>
          </div>

          <button
            onClick={handleAddLiquidity}
            disabled={
              !isConnected ||
              !contractsLoaded ||
              parseFloat(sspyAmountToAdd || '0') <= 0 ||
              parseFloat(usdcAmountToAdd || '0') <= 0 ||
              parseFloat(sspyAmountToAdd || '0') > userSspyHoldings ||
              parseFloat(usdcAmountToAdd || '0') > userUsdcHoldings ||
              isUsdcApprovePending || isUsdcApproveConfirming || pendingUsdcApprovalForLp ||
              isSspyApprovePending || isSspyApproveConfirming || pendingSspyApprovalForLp ||
              isAddLpPending || isAddLpConfirming
            }
            title={!isConnected ? "Connect wallet" : (!contractsLoaded ? "Unsupported network" : "")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            {(isUsdcApprovePending || isUsdcApproveConfirming || pendingUsdcApprovalForLp) ? 'Approving USDC...' :
             (isSspyApprovePending || isSspyApproveConfirming || pendingSspyApprovalForLp) ? 'Approving sSPY...' :
             (isAddLpPending || isAddLpConfirming) ? 'Adding Liquidity...' :
             'Add Liquidity'}
          </button>
          {addLpError && (
            <p className="text-red-400 text-sm mt-2 text-center">{addLpError}</p>
          )}
        </div>

        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 flex flex-col">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
            <ArrowDownCircle size={28} className="mr-3 text-purple-400" /> Remove Liquidity
          </h3>
          <p className="text-zinc-300 text-sm mb-6 text-center">Withdraw your assets from the sSPY/USDC liquidity pool.</p>

          <div className="space-y-5 flex-grow">
            <div className="relative">
              <label htmlFor="remove-lp-amount" className="block text-zinc-300 text-sm font-medium mb-2">
                Amount to remove (USD Value)
              </label>
              <input
                type="number"
                id="remove-lp-amount"
                placeholder="0.00"
                value={removeLpAmount}
                onChange={(e) => {
                  setRemoveLpAmount(e.target.value);
                  setRemoveLpError('');
                  setTransactionStatus(null);
                }}
                className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">$</span>
            </div>
            {userLpHoldingsValue !== null && userLpHoldingsValue > 0 && (
              <p className="text-zinc-400 text-sm mt-2 font-semibold text-center">Current LP Value: <span className="text-white">${userLpHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
            )}
          </div>

          <button
            onClick={handleRemoveLiquidity}
            disabled={
              !isConnected ||
              !contractsLoaded ||
              userLpHoldingsValue <= 0 ||
              parseFloat(removeLpAmount || '0') <= 0 ||
              parseFloat(removeLpAmount || '0') > userLpHoldingsValue ||
              isRemoveLpPending || isRemoveLpConfirming
            }
            title={!isConnected ? "Connect wallet" : (!contractsLoaded ? "Unsupported network" : "")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            {(isRemoveLpPending || isRemoveLpConfirming) ? 'Removing Liquidity...' : 'Remove Liquidity'}
          </button>
          {removeLpError && (
            <p className="text-red-400 text-sm mt-2 text-center">{removeLpError}</p>
          )}
        </div>
      </div>

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
    </main>
  );
};

export default LiquidityPage;
