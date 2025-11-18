import { ChainId } from '../types/common.types';
export interface ChainConfig {
    chainId: ChainId;
    name: string;
    rpcUrl: string;
    symbol: string;
    blockExplorer: string;
}
export declare const chainConfigs: Record<ChainId, ChainConfig>;
//# sourceMappingURL=chain.d.ts.map