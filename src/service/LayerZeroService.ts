import { DeployOption } from "../domain/DeployOption"
import { SendOption } from "../domain/SendOption"

export class LayerZeroService {

    constructor() { }

    public async deployAll(firstDeployOption: DeployOption, secondDeployOption: DeployOption) {

        console.log(`[${firstDeployOption.chain.name}] Deploying contract...`)
        const firstDeployRecipt = await this.deploy(firstDeployOption)
        const firstContract = firstDeployOption.contractType.generator.apply(null, [firstDeployOption.chain.lzChainId, firstDeployRecipt?.contractAddress!, [secondDeployOption.chain.name]])

        console.log(`[${secondDeployOption.chain.name}] Deploying contract...`)
        const secondDeployRecipt = await this.deploy(secondDeployOption)
        const secondContract = secondDeployOption.contractType.generator.apply(null, [secondDeployOption.chain.lzChainId, secondDeployRecipt?.contractAddress!, [firstDeployOption.chain.name]])

        console.log(`setTruestRemote [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await firstContract.setTrustedRemote(firstDeployOption.signer, secondContract)

        console.log(`setTruestRemote [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await secondContract.setTrustedRemote(secondDeployOption.signer, firstContract)

        console.log(`setMinDstGas [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await firstContract.setMinDstGas(firstDeployOption.signer, secondContract)

        console.log(`setMinDstGas [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await secondContract.setMinDstGas(secondDeployOption.signer, firstContract)

        firstDeployOption.chain.contracts.push(firstContract)
        secondDeployOption.chain.contracts.push(secondContract)

        console.log("Success!!!")
    }

    private async deploy(option: DeployOption) {

        const deployTx = await option.contractType.factory.getDeployTransaction(...option.depolyArgs)
        const receipt = await (await option.signer.sendTransaction(deployTx)).wait()

        console.log(receipt)

        return receipt
    }

    public async sendFrom(option: SendOption) {
        const receipt = await option.contract.sendFrom(option.signer, option.dstLzChainId, option.toAddress, option.amount)

        console.log(receipt)
        
        return receipt
    }
}