export declare enum ChainId {
    ETHEREUM = 1,
    BSC = 56,
    POLYGON = 137,
    AVALANCHE = 43114,
    ARBITRUM = 42161
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=common.types.d.ts.map