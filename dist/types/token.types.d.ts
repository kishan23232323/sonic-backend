import { ChainId } from './common.types';
export interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: ChainId;
    logoURI?: string;
    priceUSD?: number;
}
export interface TokenPrice {
    address: string;
    chainId: ChainId;
    priceUSD: number;
    priceChange24h?: number;
    lastUpdated: Date;
}
//# sourceMappingURL=token.types.d.ts.map