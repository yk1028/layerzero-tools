import Spinner from "@slimio/async-cli-spinner"
import { confirm } from '@inquirer/prompts'

import { LzChain } from "domain/Chain"
import { DeployOption } from "../domain/DeployOption"
import { SendOption } from "../domain/SendOption"
import { ChainRepository } from "../repository/ChainRepository"
import { ethers } from "ethers"
import { Logger } from "../logger/Logger"
import { InquirerException } from "../exception/InquirerException"

export class LayerZeroService {

    private static SPINNER = new Spinner()

    constructor(private readonly repository: ChainRepository = new ChainRepository()) { }

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

        await this.estimateDeployAll(firstDeployOption, secondDeployOption)

        try {
            LayerZeroService.SPINNER.start(`[${firstDeployOption.chain.name}] Deploying contract...`)
        const firstDeployRecipt = await this.deploy(firstDeployOption)
        const firstContract = await firstDeployOption.chain.addContract(firstDeployOption.contractType.name, firstDeployRecipt?.contractAddress!, [secondDeployOption.chain.name])
        LayerZeroService.SPINNER.succeed("Done!")

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
        
        } catch (e) {
            LayerZeroService.SPINNER.failed(`Failed!`)
            throw (e)
        } finally {
            LayerZeroService.SPINNER.succeed("All Done!")
        }
    }

    private async estimateDeployAll(firstDeployOption: DeployOption, secondDeployOption: DeployOption) {

        try {
            LayerZeroService.SPINNER.start(`Estimate Deploy fee...`)

            const firstDeployTx = await firstDeployOption.contractType.factory.getDeployTransaction(...firstDeployOption.depolyArgs)
            const firstDeployFee = await firstDeployOption.signer.estimateGas(firstDeployTx)
            const firstGasPrice = (await firstDeployOption.signer.provider!.getFeeData()).gasPrice!
    
            const secondDeployTx = await secondDeployOption.contractType.factory.getDeployTransaction(...secondDeployOption.depolyArgs)
            const secondDeployFee = await secondDeployOption.signer.estimateGas(secondDeployTx)
            const secondGasPrice = (await secondDeployOption.signer.provider!.getFeeData()).gasPrice!
    
            LayerZeroService.SPINNER.succeed("Done!")
    
            console.log(`[${firstDeployOption.chain.name}] deployment fee: ${ethers.formatEther(firstDeployFee * firstGasPrice)} ${firstDeployOption.chain.nativeSymbol}`)
            console.log(`[${secondDeployOption.chain.name}] deployment fee: ${ethers.formatEther(secondDeployFee * secondGasPrice)} ${secondDeployOption.chain.nativeSymbol}`)
            console.log("Estimated fees are just deployment fees. Additional fees are required for setTrustedRemote and setMinDstGas.")
    
            const answer = await confirm({
                message: `Continue deploy? `,
                transformer: (answer) => (answer ? 'Contine' : 'Cancel')
            })
    
            if (!answer) throw new InquirerException("Deploy Canceled.")
            
        } catch (e) {
            LayerZeroService.SPINNER.failed(`Failed!`)
            throw (e)
        }
    }

    private async deploy(option: DeployOption) {
        const deployTx = await option.contractType.factory.getDeployTransaction(...option.depolyArgs)

        const receipt = await (await option.signer.sendTransaction(deployTx)).wait()

        Logger.tx(receipt)

        return receipt
    }

    public async send(option: SendOption) {

        try {
            LayerZeroService.SPINNER.start(`[${option.chain.name} - ${option.signer.address}] -> [${option.dstChain.name} - ${option.toAddress}] Send...`)
            const fee = await option.contract.estimateSendFee(option.signer, option.dstChain.lzChainId, option.toAddress, option.amount)
            LayerZeroService.SPINNER.succeed(`Done!`)

            const answer = await confirm({
                message: `Confirm send (fee: ${ethers.formatEther(fee)} ${option.chain.nativeSymbol})`,
                transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
            })

            if (!answer) throw new InquirerException("Send Canceled.")

            LayerZeroService.SPINNER.start(`[${option.chain.name} - ${option.signer.address}] -> [${option.dstChain.name} - ${option.toAddress}] Send...`)
            await option.contract.sendFrom(option.signer, option.dstChain.lzChainId, option.toAddress, option.amount, fee)
            
        } catch (e) {
            LayerZeroService.SPINNER.failed(`Failed!`)
            throw (e)
        } finally {
            LayerZeroService.SPINNER.succeed(`Done!`)
        }
    }
}