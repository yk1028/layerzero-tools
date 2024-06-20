import { Wallet } from "ethers"

import { LzContract } from "../domain/lzcontract/LzContract"
import { LzChain } from "./Chain"

export class SendOption {

    public readonly confirmMessage: string

    constructor(
        public readonly chainName: string,
        public readonly contract: LzContract,
        public readonly signer: Wallet,
        public readonly dstChain: LzChain,
        public readonly toAddress: string,
        public readonly amount: string
    ) {
        this.confirmMessage = this.generateConfirmMessage()
    }

    private generateConfirmMessage(): string {
        return `[Confirm selected send opstions]
        \r   - Chain            : ${this.chainName}
        \r   - Signer (from)    : ${this.signer.address}
        \r   - Contract Type    : ${this.contract.contractType}
        \r   - Contract Address : ${this.contract.address}
        \r   - Dst Chain        : ${this.dstChain.name}
        \r   - To Address       : ${this.toAddress}
        \r   - Amount           : ${this.amount}
        \n`
    }
}