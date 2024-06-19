import { DeployOption } from "../domain/DeployOption"
import { SendOption } from "../domain/SendOption"
import { ChainRepository } from "../repository/ChainRepository"

export class LayerZeroService {

    constructor(private readonly repository: ChainRepository) { }

    public async deployAll(firstDeployOption: DeployOption, secondDeployOption: DeployOption) {

        console.log(`[${firstDeployOption.chain.name}] Deploying contract...`)
        const firstDeployRecipt = await this.deploy(firstDeployOption)

        const firstContract = await firstDeployOption.chain.addContract(firstDeployOption.contractType.name, firstDeployRecipt?.contractAddress!, [secondDeployOption.chain.name])

        console.log(`[${secondDeployOption.chain.name}] Deploying contract...`)
        const secondDeployRecipt = await this.deploy(secondDeployOption)

        const secondContract = await secondDeployOption.chain.addContract(secondDeployOption.contractType.name, secondDeployRecipt?.contractAddress!, [firstDeployOption.chain.name])

        console.log(`setTruestRemote [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await firstContract.setTrustedRemote(firstDeployOption.signer, secondContract)

        console.log(`setTruestRemote [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await secondContract.setTrustedRemote(secondDeployOption.signer, firstContract)

        console.log(`setMinDstGas [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await firstContract.setMinDstGas(firstDeployOption.signer, secondContract)

        console.log(`setMinDstGas [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await secondContract.setMinDstGas(secondDeployOption.signer, firstContract)

        this.repository.saveContract(firstDeployOption.chain.name, firstContract.address, firstContract.contractType, [secondDeployOption.chain.name])
        this.repository.saveContract(secondDeployOption.chain.name, secondContract.address, secondContract.contractType, [firstDeployOption.chain.name])

        console.log("Success!!!\n")
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