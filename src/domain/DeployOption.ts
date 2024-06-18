import { ContractMethodArgs, Wallet } from "ethers";

import { Chain } from "../domain/Chain";
import { LzContractType } from "../domain/lzcontract/LzContractType";

export class DeployOption {

    public readonly confirmMessage: string
    public readonly depolyArgs: ContractMethodArgs<any[]>

    constructor(
        public readonly chain: Chain,
        public readonly signer: Wallet,
        public readonly contractType: LzContractType,
        args: Object[]
    ) {
        this.confirmMessage = this.generateMessage(args)
        this.depolyArgs = []

        for (const key in args) {
            this.depolyArgs.push(args[key])
        }
    }

    private generateMessage(args: Object[]): string {

        let argMessage = ""

        for (const key in args) {
            argMessage += `         - ${key} : ${args[key]}\n`
        }

        return `Confirm selected opstions!
        \r - Chain          : ${this.chain.name}
        \r - Signer         : ${this.signer.address}
        \r - Contract Type  : ${this.contractType.name}
        \r - Constract Args 
        \r${argMessage}`
    }
}