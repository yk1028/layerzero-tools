import { Contract } from "ethers"
import { LzContractType } from "./LzContractType"

export class LzContract {
    
    public readonly contract: Contract;
    
    constructor(
        public readonly address: string,
        public readonly type: LzContractType,
        public readonly dstChains: string[]
    ) { 
        this.contract = new Contract(address, type.abi);
    }
}