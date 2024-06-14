import { Contract, Wallet } from "ethers"
import { LzContractType } from "./LzContractType"

export class LzContract {

    constructor(
        public readonly lzChainId: string,
        public readonly address: string,
        public readonly type: LzContractType,
        public readonly dstChains: string[]
    ) { }

    public getContractWithSigner(signer: Wallet): Contract {
        return new Contract(this.address, this.type.abi, signer)
    }
}