import { Wallet } from "ethers"
import { LzContract } from "./LzContract"

export class Chain {
    constructor(
        public readonly name: string,
        public readonly chainId: string,
        public readonly nativeSymbol: string,
        public readonly rpc: string,
        public readonly explorer: string,
        public readonly lzChainId: string,
        public readonly lzEndpoin: string,
        public readonly accounts: Wallet[],
        public readonly contracts: LzContract[]
    ) { }
}