import { LzContract } from "../domain/LzContract"
import { DeployOption } from "../domain/DeployOption"

export class LayerZeroService {

    constructor() { }

    public async deployAll(firstDeployOption: DeployOption, secondDeployOption: DeployOption) {

        console.log(` Deploying contract...`)
        const firstDeployRecipt = await this.depoly(firstDeployOption)
        const firstContract = new LzContract(firstDeployOption.chain.lzChainId, firstDeployRecipt?.contractAddress!, firstDeployOption.contractType, [firstDeployOption.chain.name])

        console.log(`[${secondDeployOption.chain.name}] Deploying contract...`)
        const secondDeployRecipt = await this.depoly(secondDeployOption)
        const secondContract = new LzContract(secondDeployOption.chain.lzChainId, secondDeployRecipt?.contractAddress!, secondDeployOption.contractType, [secondDeployOption.chain.name])

        console.log(`setTruestRemote [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await firstContract.setTrustedRemote(firstDeployOption.signer, secondContract)

        console.log(`setTruestRemote [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await secondContract.setTrustedRemote(secondDeployOption.signer, firstContract)

        console.log(`setMinDstGas [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await firstContract.setMinDstGas(firstDeployOption.signer, secondContract)

        console.log(`setMinDstGas [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await secondContract.setMinDstGas(secondDeployOption.signer, firstContract)
    }

    private async depoly(option: DeployOption) {

        const deployTx = await option.contractType.factory.getDeployTransaction(...option.depolyArgs)
        const receipt = await (await option.signer.sendTransaction(deployTx)).wait()

        console.log(receipt)

        return receipt
    }
}