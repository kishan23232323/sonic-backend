import { ChainId } from '../types/common.types';

export interface ChainConfig {
  chainId: ChainId;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorer: string;
}

export const chainConfigs: Record<ChainId, ChainConfig> = {
  [ChainId.ETHEREUM]: {
    chainId: ChainId.ETHEREUM,
    name: 'Ethereum',
    rpcUrl: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io',
  },
  [ChainId.BSC]: {
    chainId: ChainId.BSC,
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com',
  },
  [ChainId.POLYGON]: {
    chainId: ChainId.POLYGON,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com',
  },
  [ChainId.AVALANCHE]: {
    chainId: ChainId.AVALANCHE,
    name: 'Avalanche',
    rpcUrl: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    blockExplorer: 'https://snowtrace.io',
  },
  [ChainId.ARBITRUM]: {
    chainId: ChainId.ARBITRUM,
    name: 'Arbitrum',
    rpcUrl: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    blockExplorer: 'https://arbiscan.io',
  },
};