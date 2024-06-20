import { ContractMethodArgs, Wallet } from "ethers"

import { LzChain } from "../domain/Chain"
import { ContractDeploySupporter } from "./ContractDeploySupporter"

export class DeployOption {

    public readonly confirmMessage: string
    public readonly depolyArgs: ContractMethodArgs<any[]>

    constructor(
        public readonly chain: LzChain,
        public readonly signer: Wallet,
        public readonly contractType: ContractDeploySupporter,
        args: Object[]
    ) {
        this.confirmMessage = this.generateConfirmMessage(args)
        this.depolyArgs = []

        for (const key in args) {
            this.depolyArgs.push(args[key])
        }
    }

    private generateConfirmMessage(args: Object[]): string {

        let argMessage = ""

        for (const key in args) {
            argMessage += `          L ${key.padEnd(14)} : ${args[key]}\n`
        }

        return `Confirm selected deploy opstions!
        \r  - Chain          : ${this.chain.name}
        \r  - Signer         : ${this.signer.address}
        \r  - Contract Type  : ${this.contractType.name}
        \r  - Constract Args 
        \r${argMessage}\n`
    }
}