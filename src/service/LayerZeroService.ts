import Spinner from "@slimio/async-cli-spinner"

import { LzChain } from "domain/Chain"
import { DeployOption } from "../domain/DeployOption"
import { SendOption } from "../domain/SendOption"
import { ChainRepository } from "../repository/ChainRepository"

export class LayerZeroService {

    private static SPINNER = new Spinner()

    constructor(private readonly repository: ChainRepository) { }

    public getChains(): LzChain[] {
        return [...this.repository.chains.values()]
    }

    public getChain(name: string): LzChain {
        return this.repository.chains.get(name)!
    }

    public queryChains(): void {
        const chains = [...this.repository.chains.values()]

        chains.forEach(chain => console.log(chain))
    }

    public async deployAll(firstDeployOption: DeployOption, secondDeployOption: DeployOption) {

        LayerZeroService.SPINNER.start(`[${firstDeployOption.chain.name}] Deploying contract...`);
        const firstDeployRecipt = await this.deploy(firstDeployOption)
        const firstContract = await firstDeployOption.chain.addContract(firstDeployOption.contractType.name, firstDeployRecipt?.contractAddress!, [secondDeployOption.chain.name])
        LayerZeroService.SPINNER.succeed("Done!");

        LayerZeroService.SPINNER.start(`[${secondDeployOption.chain.name}] Deploying contract...`)
        const secondDeployRecipt = await this.deploy(secondDeployOption)
        const secondContract = await secondDeployOption.chain.addContract(secondDeployOption.contractType.name, secondDeployRecipt?.contractAddress!, [firstDeployOption.chain.name])
        LayerZeroService.SPINNER.succeed("Done!");

        LayerZeroService.SPINNER.start(`[${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}] setTruestRemote...`)
        await firstContract.setTrustedRemote(firstDeployOption.signer, secondContract)
        LayerZeroService.SPINNER.succeed("Done!");

        LayerZeroService.SPINNER.start(`[${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}] setTruestRemote...`)
        await secondContract.setTrustedRemote(secondDeployOption.signer, firstContract)
        LayerZeroService.SPINNER.succeed("Done!");

        LayerZeroService.SPINNER.start(`[${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}] setMinDstGas...`)
        await firstContract.setMinDstGas(firstDeployOption.signer, secondContract)
        LayerZeroService.SPINNER.succeed("Done!");

        LayerZeroService.SPINNER.start(`[${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}] setMinDstGas...`)
        await secondContract.setMinDstGas(secondDeployOption.signer, firstContract)
        LayerZeroService.SPINNER.succeed("Done!");

        LayerZeroService.SPINNER.start(`Save contract to file...`)
        this.repository.saveContract(firstDeployOption.chain.name, firstContract.address, firstContract.contractType, [secondDeployOption.chain.name])
        this.repository.saveContract(secondDeployOption.chain.name, secondContract.address, secondContract.contractType, [firstDeployOption.chain.name])
        LayerZeroService.SPINNER.succeed("All Done!");
    }

    private async deploy(option: DeployOption) {

        const deployTx = await option.contractType.factory.getDeployTransaction(...option.depolyArgs)
        const receipt = await (await option.signer.sendTransaction(deployTx)).wait()

        console.log(receipt)

        return receipt
    }

    public async sendFrom(option: SendOption) {
        LayerZeroService.SPINNER.start(`[${option.chainName} - ${option.signer.address}] -> [${option.dstChain} - ${option.toAddress}] Send...`)
        const receipt = await option.contract.sendFrom(option.signer, option.dstChain.lzChainId, option.toAddress, option.amount)
        LayerZeroService.SPINNER.start(`Done!`)

        console.log(receipt)

        return receipt
    }
}