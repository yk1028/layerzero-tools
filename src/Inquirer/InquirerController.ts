import select from '@inquirer/select'
import { confirm, input } from '@inquirer/prompts'
import { Wallet } from 'ethers'

import { ChainRepository } from '../repository/ChainRepository'
import { LzChain } from '../domain/Chain'
import { ContractDeploySupporter, LzContractDepoloySupporters } from '../domain/ContractDeploySupporter'
import { LayerZeroService } from '../service/LayerZeroService'
import { DeployOption } from '../domain/DeployOption'
import { LzContract } from '../domain/lzcontract/LzContract'
import { SendOption } from '../domain/SendOption'
import Spinner from '@slimio/async-cli-spinner'

export class InquirerController {

    private static SPINNER = new Spinner()

    private layerzeroService: LayerZeroService

    constructor() {
        const repository = new ChainRepository()
        this.layerzeroService = new LayerZeroService(repository)
    }

    public async start() {
        let selectInit
        do {
            try {
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
            } catch (e) {
                console.log(e)
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

        console.log("Select the first chain options")

        const firstDeployOption = await this.selectDeployOptions()

        if (!await this.confirmInput(firstDeployOption.confirmMessage)) return

        console.log("Select the first chain options.")

        const secondDeployOption = await this.selectDeployOptions(firstDeployOption.chain.name)

        if (!await this.confirmInput(secondDeployOption.confirmMessage)) return

        if (!await this.confirmInput(firstDeployOption.confirmMessage + secondDeployOption.confirmMessage)) return

        await this.layerzeroService.deployAll(firstDeployOption, secondDeployOption)
    }

    public async send() {

        const chain = await this.selectChain()
        const signer = await this.selectSigner(chain)
        const contract = await this.selectContractWithBalance(chain, signer)
        const dstChain = await this.selectDstChain(contract)
        const toAddress = await this.inputToAddress()
        const amount = await this.inputAmount()

        const option = new SendOption(chain.name, contract, signer, dstChain, toAddress, amount)

        if (!await this.confirmInput(option.confirmMessage)) return

        await this.layerzeroService.sendFrom(option)
    }

    private async confirmInput(confirmMessage: string): Promise<boolean> {
        const answer = await confirm({
            message: confirmMessage,
            transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
        })

        if (!answer) console.log("Canceled.")

        return answer
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

        InquirerController.SPINNER.start(`Loading...`)
        for (const contract of chain.getContracts()) {
            contractChoices.push({
                name: `${contract.address}`,
                value: contract,
                description: `\n[contract information]${await contract.printWithBalance(wallet)}`
            })
        }
        InquirerController.SPINNER.succeed(`Done!`)

        return await select({
            message: 'Which contract do you want?',
            choices: contractChoices
        })
    }

    private async selcetContractType(): Promise<ContractDeploySupporter> {
        const contractTypeChoices = [...LzContractDepoloySupporters.values()]
            .map(type => {
                return { name: type.name, value: type }
            })

        return await select({
            message: 'Which contract type do you want?',
            choices: contractTypeChoices
        })
    }

    private async selectDstChain(contract: LzContract): Promise<LzChain> {
        const dstChainChoices = [...contract.dstChains]
            .map(chain => {
                return { name: chain, value: this.layerzeroService.getChain(chain) }
            })

        return await select({
            message: 'Which destination chain do you want?',
            choices: dstChainChoices
        })
    }

    private async inputArgs(contractType: ContractDeploySupporter) {
        let inputArgs: any = {}

        for (const arg of contractType.deployArgs) {
            inputArgs[arg.name] = await input({ message: `Enter ${arg.name}:`, validate: arg.validate })
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