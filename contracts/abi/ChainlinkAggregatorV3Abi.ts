// contracts/ChainlinkAggregatorV3Abi.ts
// This ABI is generated from MockChainlinkAggregator.json artifact.
// It includes the standard Chainlink AggregatorV3Interface functions
// like `decimals` and `latestRoundData`, plus mock-specific setter functions.
export const chainlinkAggregatorV3Abi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "initialAnswer",
        "type": "int256",
        "internalType": "int256"
      },
      {
        "name": "initialDecimals",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "latestRoundData",
    "inputs": [],
    "outputs": [
      {
        "name": "roundId",
        "type": "uint80",
        "internalType": "uint80"
      },
      {
        "name": "answer",
        "type": "int256",
        "internalType": "int256"
      },
      {
        "name": "startedAt",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "updatedAt",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "answeredInRound",
        "type": "uint80",
        "internalType": "uint80"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setAnswer",
    "inputs": [
      {
        "name": "newAnswer",
        "type": "int256",
        "internalType": "int256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setDecimals",
    "inputs": [
      {
        "name": "newDecimals",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;
