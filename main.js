const loggerTheme = {

  reset: "\x1b[0m",

  bold: "\x1b[1m",

  italic: "\x1b[3m",

  underline: "\x1b[4m",

  red: "\x1b[31m",

  green: "\x1b[32m",

  yellow: "\x1b[33m",

  blue: "\x1b[34m",

  magenta: "\x1b[35m",

  cyan: "\x1b[36m",

  white: "\x1b[37m",

  bgGray: "\x1b[100m",

};


const fancyBox = (title, subtitle) => {

  console.log(`${loggerTheme.cyan}${loggerTheme.bold}`);

  console.log('╔══════════════════════════════════════════════╗');

  console.log(`║  ${title.padEnd(42)}  ║`);

  if (subtitle) {

    console.log(`║  ${subtitle.padEnd(42)}  ║`);

  }

  console.log('╚══════════════════════════════════════════════╝');

  console.log(loggerTheme.reset);

};

const logger = {

  info: (msg) => console.log(`${loggerTheme.blue}[ ℹ️ INFO ] → ${msg}${loggerTheme.reset}`),

  warn: (msg) => console.log(`${loggerTheme.yellow}[ ⚠️ WARNING ] → ${msg}${loggerTheme.reset}`),

  error: (msg) => console.log(`${loggerTheme.red}[ ✖️ ERROR ] → ${msg}${loggerTheme.reset}`),

  success: (msg) => console.log(`${loggerTheme.green}[ ✔️ DONE ] → ${msg}${loggerTheme.reset}`),

  loading: (msg) => console.log(`${loggerTheme.cyan}[ ⌛️ LOADING ] → ${msg}${loggerTheme.reset}`),

  step: (msg) => console.log(`${loggerTheme.magenta}[ ➔ STEP ] → ${msg}${loggerTheme.reset}`),

  banner: () => fancyBox(' 🍉🍉 Free Plestine 🍉🍉', '— 19Seniman From Insider 🏴‍☠️ —'),

};

require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const routerAddress = '0xb95B5953FF8ee5D5d9818CdbEfE363ff2191318c';
const zer0dexAddress = process.env.ZER0DEX_CONTRACT;

const TOKENS = [
  { symbol: 'USDT', address: process.env.USDT_TOKEN },
  { symbol: 'BTC', address: process.env.BTC_TOKEN },
  { symbol: 'ETH', address: process.env.ETH_TOKEN }
];

const FEE = 100; // 0.01%

const routerAbi = [
  "function exactInputSingle(tuple(address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint256 deadline,uint160 sqrtPriceLimitX96)) external payable returns (uint256)"
];

const zer0dexAbi = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "token0", "type": "address" },
          { "internalType": "address", "name": "token1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickLower", "type": "int24" },
          { "internalType": "int24", "name": "tickUpper", "type": "int24" },
          { "internalType": "uint256", "name": "amount0Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount0Min", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Min", "type": "uint256" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct MintParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const erc20Abi = [
  "function balanceOf(address) view returns (uint)",
  "function approve(address spender, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const pairs = [
  ["ETH", "BTC"],
  ["ETH", "USDT"],
  ["BTC", "USDT"]
];

function getRandomTokenPair() {
  let i = Math.floor(Math.random() * TOKENS.length);
  let j;
  do {
    j = Math.floor(Math.random() * TOKENS.length);
  } while (j === i);
  return [TOKENS[i], TOKENS[j]];
}

function getRandomPercentage(min = 0.01, max = 0.05) {
  return Math.random() * (max - min) + min;
}

function getRandomPercent(min = 10, max = 15) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDelay(minSec = 10, maxSec = 20) {
  const ms = Math.floor(Math.random() * (maxSec - minSec + 1) + minSec) * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fungsi untuk mendapatkan nonce saat ini dari wallet
async function getCurrentNonce(wallet) {
  return await wallet.provider.getTransactionCount(wallet.address, 'latest');
}

async function main() {
  const swapCount = parseInt(process.env.SWAP_COUNT || '3', 10);

  const wallets = Object.entries(process.env)
    .filter(([k, v]) => k.startsWith("PRIVATE_KEY") && v.startsWith("0x") && v.length === 66)
    .map(([_, v]) => v);

  for (let w = 0; w < wallets.length; w++) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(wallets[w], provider);
    const walletAddress = ethers.getAddress(await wallet.getAddress());

    console.log(`\n\u{1F4BC} Wallet #${w + 1}: ${walletAddress}`);

    const router = new ethers.Contract(routerAddress, routerAbi, wallet);
    const dex = new ethers.Contract(zer0dexAddress, zer0dexAbi, wallet);

    // Dapatkan nonce awal untuk wallet ini
    let currentNonce = await getCurrentNonce(wallet);

    // === SWAP ===
    for (let i = 0; i < swapCount; i++) {
      const [fromToken, toToken] = getRandomTokenPair();
      const token = new ethers.Contract(fromToken.address, erc20Abi, wallet);

      const decimals = await token.decimals();
      const balance = await token.balanceOf(walletAddress);
      if (balance === 0n) {
        console.log(`Saldo ${fromToken.symbol} kosong. Skip.`);
        continue;
      }

      const percentage = getRandomPercentage();
      const amountIn = BigInt(Math.floor(Number(balance) * percentage));
      const amountOutMin = amountIn / 2n;

      const allowance = await token.allowance(walletAddress, routerAddress);
      if (allowance < amountIn) {
        console.log(`Approving ${fromToken.symbol}...`);
        try {
          const approveTx = await token.approve(routerAddress, amountIn, { nonce: currentNonce++ }); // Gunakan nonce dan tingkatkan
          await approveTx.wait();
          console.log(`✅ Approve Success! Tx Hash: ${approveTx.hash}`);
        } catch (err) {
          console.error(`❌ Gagal approve ${fromToken.symbol}:`, err?.shortMessage || err);
          // Mungkin perlu mencoba lagi atau skip transaksi ini jika approve gagal
          continue; 
        }
      }

      const deadline = Math.floor(Date.now() / 1000) + 600;

      const params = {
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: FEE,
        recipient: walletAddress,
        amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0,
        deadline: BigInt(deadline)
      };

      console.log(`\u{1F501} Swap ${fromToken.symbol} → ${toToken.symbol} | Amount: ${ethers.formatUnits(amountIn, decimals)}`);

      try {
        // Estimasi gas limit sebelum mengirim transaksi
        const estimatedGas = await router.exactInputSingle.estimateGas(params);
        // Tambahkan buffer ke gas limit yang diestimasi
        const gasLimitWithBuffer = estimatedGas * 120n / 100n; // Tambah 20%
        
        const tx = await router.exactInputSingle(params, { gasLimit: gasLimitWithBuffer, nonce: currentNonce++ }); // Gunakan nonce dan tingkatkan
        const receipt = await tx.wait();
        console.log(`✅ Swap Success! Tx Hash: ${receipt.hash}`);
      } catch (err) {
        console.error(`❌ Gagal swap ${fromToken.symbol} → ${toToken.symbol}:`, err?.shortMessage || err);
        // Jika ada error REPLACEMENT_UNDERPRICED, bisa coba tingkatkan gasPrice/maxFeePerGas
        // Atau Anda mungkin ingin mendapatkan nonce terbaru lagi jika terjadi error yang tidak terduga
        if (err.code === 'REPLACEMENT_UNDERPRICED') {
            console.log("Mencoba mendapatkan nonce terbaru karena REPLACEMENT_UNDERPRICED...");
            currentNonce = await getCurrentNonce(wallet);
        }
      }

      await getRandomDelay();
    }

    // === MINT ===
    const totalRuns = Math.floor(Math.random() * 5) + 1;
    console.log(`\n🔁 Mulai ${totalRuns} aksi add liquidity`);

    for (let r = 1; r <= totalRuns; r++) {
      const [name0, name1] = pairs[Math.floor(Math.random() * pairs.length)];
      const addr0 = process.env[`${name0}_TOKEN`];
      const addr1 = process.env[`${name1}_TOKEN`];

      const token0 = new ethers.Contract(addr0, erc20Abi, wallet);
      const token1 = new ethers.Contract(addr1, erc20Abi, wallet);

      const bal0 = await token0.balanceOf(walletAddress);
      const bal1 = await token1.balanceOf(walletAddress);

      if (bal0 === 0n || bal1 === 0n) {
        console.log(`[${r}] ❌ Saldo ${name0}/${name1} kosong. Skip.`);
        continue;
      }

      const dec0 = await token0.decimals();
      const dec1 = await token1.decimals();

      const pct0 = getRandomPercent();
      const pct1 = getRandomPercent();
      const amt0 = bal0 * BigInt(pct0) / 100n;
      const amt1 = bal1 * BigInt(pct1) / 100n;

      console.log(`\n[${r}] ✅ Add liquidity ${name0}/${name1}`);
      console.log(`→ ${pct0}% ${name0}: ${ethers.formatUnits(amt0, dec0)}`);
      console.log(`→ ${pct1}% ${name1}: ${ethers.formatUnits(amt1, dec1)}`);

      try {
        // Approve token0
        const allowance0 = await token0.allowance(walletAddress, zer0dexAddress);
        if (allowance0 < amt0) {
            console.log(`[${r}] Approving ${name0}...`);
            const approveTx0 = await token0.approve(zer0dexAddress, amt0, { nonce: currentNonce++ });
            await approveTx0.wait();
            console.log(`[${r}] ✅ Approve ${name0} Success! Tx Hash: ${approveTx0.hash}`);
        } else {
            console.log(`[${r}] ${name0} sudah di-approve.`);
        }

        // Approve token1
        const allowance1 = await token1.allowance(walletAddress, zer0dexAddress);
        if (allowance1 < amt1) {
            console.log(`[${r}] Approving ${name1}...`);
            const approveTx1 = await token1.approve(zer0dexAddress, amt1, { nonce: currentNonce++ });
            await approveTx1.wait();
            console.log(`[${r}] ✅ Approve ${name1} Success! Tx Hash: ${approveTx1.hash}`);
        } else {
            console.log(`[${r}] ${name1} sudah di-approve.`);
        }
      } catch (err) {
        console.error(`[${r}] ❌ Gagal approve token untuk mint:`, err?.shortMessage || err);
        if (err.code === 'REPLACEMENT_UNDERPRICED') {
            console.log("Mencoba mendapatkan nonce terbaru karena REPLACEMENT_UNDERPRICED...");
            currentNonce = await getCurrentNonce(wallet);
        }
        continue; // Skip mint jika approve gagal
      }

      const deadline = Math.floor(Date.now() / 1000) + 300;

      const mintParams = [
        addr0,
        addr1,
        3000,
        -887220,
        887220,
        amt0,
        amt1,
        0,
        0,
        walletAddress,
        deadline
      ];

      try {
        // Estimasi gas limit sebelum mengirim transaksi mint
        const estimatedGasMint = await dex.mint.estimateGas(mintParams);
        const gasLimitMintWithBuffer = estimatedGasMint * 120n / 100n; // Tambah 20%

        const tx = await dex.mint(mintParams, { gasLimit: gasLimitMintWithBuffer, nonce: currentNonce++ }); // Gunakan nonce dan tingkatkan
        console.log(`[${r}] 🚀 TX terkirim: ${tx.hash}`);
        await tx.wait();
        console.log(`[${r}] 🎉 Sukses!`);
      } catch (err) {
        console.error(`[${r}] ❌ Gagal mint:`, err?.shortMessage || err);
        if (err.code === 'REPLACEMENT_UNDERPRICED') {
            console.log("Mencoba mendapatkan nonce terbaru karena REPLACEMENT_UNDERPRICED...");
            currentNonce = await getCurrentNonce(wallet);
        }
      }

      if (r < totalRuns) await getRandomDelay();
    }

    console.log(`\n✅ Semua aksi selesai untuk wallet ${walletAddress}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
