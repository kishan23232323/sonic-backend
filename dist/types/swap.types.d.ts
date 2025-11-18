import { ChainId } from './common.types';
export interface SwapTransaction {
    txHash: string;
    userAddress: string;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    chainId: ChainId;
    status: SwapStatus;
    timestamp: Date;
    gasUsed?: string;
    gasPrice?: string;
}
export declare enum SwapStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    FAILED = "failed"
}
export interface SwapHistoryQuery {
    userAddress: string;
    chainId?: ChainId;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=swap.types.d.ts.map