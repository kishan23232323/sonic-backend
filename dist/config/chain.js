"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainConfigs = void 0;
const common_types_1 = require("../types/common.types");
exports.chainConfigs = {
    [common_types_1.ChainId.ETHEREUM]: {
        chainId: common_types_1.ChainId.ETHEREUM,
        name: 'Ethereum',
        rpcUrl: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
        symbol: 'ETH',
        blockExplorer: 'https://etherscan.io',
    },
    [common_types_1.ChainId.BSC]: {
        chainId: common_types_1.ChainId.BSC,
        name: 'BNB Smart Chain',
        rpcUrl: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org',
        symbol: 'BNB',
        blockExplorer: 'https://bscscan.com',
    },
    [common_types_1.ChainId.POLYGON]: {
        chainId: common_types_1.ChainId.POLYGON,
        name: 'Polygon',
        rpcUrl: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
        symbol: 'MATIC',
        blockExplorer: 'https://polygonscan.com',
    },
    [common_types_1.ChainId.AVALANCHE]: {
        chainId: common_types_1.ChainId.AVALANCHE,
        name: 'Avalanche',
        rpcUrl: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        symbol: 'AVAX',
        blockExplorer: 'https://snowtrace.io',
    },
    [common_types_1.ChainId.ARBITRUM]: {
        chainId: common_types_1.ChainId.ARBITRUM,
        name: 'Arbitrum',
        rpcUrl: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
        symbol: 'ETH',
        blockExplorer: 'https://arbiscan.io',
    },
};
//# sourceMappingURL=chain.js.map