import select from '@inquirer/select'
import { confirm, input } from '@inquirer/prompts'
import { Wallet } from 'ethers'

import { ChainRepository } from '../repository/ChainRepository'
import { LzChain } from '../domain/Chain'
import { LzContractDeployer, LzContractDepoloyers } from '../domain/lzcontract/LzContractDeployer'
import { LayerZeroService } from '../service/LayerZeroService'
import { DeployOption } from '../domain/DeployOption'
import { LzContract } from '../domain/lzcontract/LzContract'
import { SendOption } from '../domain/SendOption'

export class InquirerController {

    private layerzeroService: LayerZeroService

    constructor() {
        const repository = new ChainRepository()
        this.layerzeroService = new LayerZeroService(repository)
    }

    public async start() {
        let selectInit
        do {
            selectInit = await select({
                message: 'What do you want?',
                choices: [
                    { name: 'Query', value: 'query' },
                    { name: 'Deploy', value: 'deploy' },
                    { name: 'Send', value: 'send' },
                    { name: 'Exit', value: 'exit' },
                ]
            })

            switch (selectInit) {
                case 'query':
                    await this.query()
                    break
                case 'deploy':
                    await this.depoly()
                    break
                case 'send':
                    await this.send()
                    break
                default:
                    break;
            }
        } while (selectInit != 'exit');

        console.log('bye!')
    }

    public async query() {
        const selectInfo = await select({
            message: 'Which data do you want?',
            choices: [
                { name: 'Chains', value: 'chains' },
                { name: 'Accounts', value: 'accounts' },
                { name: 'Contracts', value: 'contracts' },
                { name: 'Exit', value: 'exit' },
            ]
        })

        switch (selectInfo) {
            case 'chains':
                this.layerzeroService.getChains().forEach((chain) => console.log(chain.printChain()))
                break
            case 'accounts':
                this.layerzeroService.getChains().forEach((chain) => console.log(chain.printAccounts()))
                break
            case 'contracts':
                this.layerzeroService.getChains().forEach((chain) => console.log(chain.printContracts()))
                break
            default:
                break
        }
    }

    private async depoly() {

        const firstDeployOption = await this.selectDeployOptions()

        let answer = await confirm({
            message: firstDeployOption.confirmMessage,
            transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
        })

        if (!answer) {
            console.log("Cancel deploy!")
            return
        }

        console.log("Next chain choice")

        const secondDeployOption = await this.selectDeployOptions(firstDeployOption.chain.name)

        answer = await confirm({
            message: secondDeployOption.confirmMessage,
            transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
        })

        if (!answer) {
            console.log("Cancel deploy!")
            return
        }

        answer = await confirm({
            message: firstDeployOption.confirmMessage + secondDeployOption.confirmMessage,
            transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
        })

        if (!answer) {
            console.log("Cancel deploy!")
            return
        }

        await this.layerzeroService.deployAll(firstDeployOption, secondDeployOption)
    }

    public async send() {

        const chain = await this.selectChain()
        const signer = await this.selectSigner(chain)
        const contract = await this.selectContractWithBalance(chain, signer)
        const dstChainId = await this.selectDstChainId(contract)
        const toAddress = await this.inputToAddress()
        const amount = await this.inputAmount()

        const option = new SendOption(chain.name, contract, signer, dstChainId, toAddress, amount)

        let answer = await confirm({
            message: option.confirmMessage,
            transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
        })

        if (!answer) {
            console.log("Cancel send!")
            return
        }

        await this.layerzeroService.sendFrom(option)
    }

    private async selectDeployOptions(selectedChain: string | void) {
        const chain = await this.selectChain(selectedChain)
        const signer = await this.selectSigner(chain)
        const contractType = await this.selcetContractType()
        const args = await this.inputArgs(contractType)
        args["lzEndpoint"] = chain.lzEndpoint

        return new DeployOption(chain, signer, contractType, args)
    }

    private async selectChain(selectedChain: string | void): Promise<LzChain> {
        const chainChoices = this.layerzeroService
            .getChains()
            .map((chain) => {
                if (chain.name == selectedChain) {
                    return { name: chain.name, value: chain, disabled: "(Already selected)" }
                }
                return { name: chain.name, value: chain }
            })

        return await select({
            message: 'Which chain do you want?',
            choices: chainChoices
        })
    }

    private async selectSigner(chain: LzChain): Promise<Wallet> {
        const signerChoices = chain.getAccounts()
            .map(account => {
                return { name: account.address, value: account }
            })

        return await select({
            message: 'Which wallet do you want?',
            choices: signerChoices
        })
    }

    private async selectContractWithBalance(chain: LzChain, wallet: Wallet): Promise<LzContract> {
        const contractChoices = []

        for (const contract of chain.getContracts()) {
            contractChoices.push({
                name: `${contract.address}`,
                value: contract,
                description: `\n[contract information]${await contract.printWithBalance(wallet)}`
            })
        }

        return await select({
            message: 'Which contract do you want?',
            choices: contractChoices
        })
    }

    private async selcetContractType(): Promise<LzContractDeployer> {
        const contractTypeChoices = [...LzContractDepoloyers.values()]
            .map(type => {
                return { name: type.name, value: type }
            })

        return await select({
            message: 'Which ContractType do you want?',
            choices: contractTypeChoices
        })
    }

    private async selectDstChainId(contract: LzContract): Promise<string> {
        const dstChainChoices = [...contract.dstChains]
            .map(chain => {
                return { name: chain, value: this.layerzeroService.getChain(chain).lzChainId }
            })

        return await select({
            message: 'Which dstChain do you want?',
            choices: dstChainChoices
        })
    }

    private async inputArgs(contractType: LzContractDeployer) {
        let inputArgs: any = {}

        for (const arg of contractType.deployArgs) {
            inputArgs[arg] = await input({ message: `Enter ${arg}:` })
        }

        return inputArgs
    }

    private async inputToAddress() {
        return await input({ message: `Enter toAddress:` })
    }

    private async inputAmount() {
        return await input({ message: `Enter amount:` })
    }
}