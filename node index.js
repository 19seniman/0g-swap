   const Web3 = require('web3');
   const fs = require('fs');
   const chalk = require('chalk');

   // Inisialisasi Web3
   const web3 = new Web3('https://evmrpc-testnet.0g.ai');

   // Token configuration
   const TOKENS = [
       { 
           address: '0x3ec8a8705be1d5ca90066b37ba62c4183b024ebf',
           symbol: 'USDT'
       },
       {
           address: '0x0fe9b43625fa7edd663adcec0728dd635e4abf7c',
           symbol: 'ETH'
       },
       {
           address: '0x36f6414ff1df609214ddaba71c84f18bcf00f67d',
           symbol: 'BTC'
       }
   ];

   // Constants
   const ROUTER_ADDRESS = '0xb95B5953FF8ee5D5d9818CdbEfE363ff2191318c';
   const POOL_FEE = 3000;
   const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10;
   const MAX_ALLOWANCE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

   // ABI definitions
   const erc20ABI = [
       {
           "constant": true,
           "inputs": [
               {"name": "owner", "type": "address"},
               {"name": "spender", "type": "address"}
           ],
           "name": "allowance",
           "outputs": [{"name": "", "type": "uint256"}],
           "payable": false,
           "stateMutability": "view",
           "type": "function"
       },
       {
           "constant": true,
           "inputs": [{"name": "owner", "type": "address"}],
           "name": "balanceOf",
           "outputs": [{"name": "", "type": "uint256"}],
           "payable": false,
           "type": "function"
       },
       {
           "constant": false,
           "inputs": [
               {"name": "spender", "type": "address"},
               {"name": "amount", "type": "uint256"}
           ],
           "name": "approve",
           "outputs": [{"name": "", "type": "bool"}],
           "payable": false,
           "stateMutability": "nonpayable",
           "type": "function"
       }
   ];


const routerABI = [
    {
        "constant": false,
        "inputs": [
            { 
                "name": "params", 
                "type": "tuple", 
                "components": [
                    {"name": "tokenIn", "type": "address"},
                    {"name": "tokenOut", "type": "address"},
                    {"name": "fee", "type": "uint24"},
                    {"name": "recipient", "type": "address"},
                    {"name": "deadline", "type": "uint256"},
                    {"name": "amountIn", "type": "uint256"},
                    {"name": "amountOutMinimum", "type": "uint256"},
                    {"name": "sqrtPriceLimitX96", "type": "uint160"}
                ]
            }
        ],
        "name": "exactInputSingle",
        "outputs": [{"name": "amountOut", "type": "uint256"}],
        "payable": false,
        "stateMutability": "nonpay
