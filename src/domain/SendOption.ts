import { Wallet } from "ethers";
import { LzContract } from "./lzcontract/LzContract";

export class SendOption {

    public readonly confirmMessage: string

    constructor(
        public readonly contract: LzContract,
        public readonly signer: Wallet,
        public readonly dstLzChainId: string,
        public readonly toAddress: string,
        public readonly amount: string
    ) {
        this.confirmMessage = this.generateMessage()
     }

    private generateMessage(): string {
        return `Confirm selected opstions!
        \r - Chain            : ${this.contract}
        \r - Signer (from)    : ${this.signer.address}
        \r - Contract Type    : ${this.contract.contractType}
        \r - Contract Address : ${this.contract.address}
        \r - To Address       : ${this.toAddress}
        \r - Amount           : ${this.amount}
        `
    }
}