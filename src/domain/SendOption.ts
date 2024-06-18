import { Wallet } from "ethers";

import { LzContract } from "../domain/lzcontract/LzContract";

export class SendOption {

    public readonly confirmMessage: string

    constructor(
        public readonly chainName:string,
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
        \r - Chain            : ${this.chainName}
        \r - Signer (from)    : ${this.signer.address}
        \r - Contract Type    : ${this.contract.contractType}
        \r - Contract Address : ${this.contract.address}
        \r - To Address       : ${this.toAddress}
        \r - Amount           : ${this.amount}
        `
    }
}