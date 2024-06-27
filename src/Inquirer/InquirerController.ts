import select from '@inquirer/select'
import { confirm, input } from '@inquirer/prompts'
import { Wallet } from 'ethers'

import { LzChain } from '../domain/Chain'
import { ContractDeploySupporter, LzContractDepoloySupporters } from '../domain/ContractDeploySupporter'
import { LayerZeroService } from '../service/LayerZeroService'
import { DeployOption } from '../domain/DeployOption'
import { LzContract } from '../domain/lzcontract/LzContract'
import { SendOption } from '../domain/SendOption'
import Spinner from '@slimio/async-cli-spinner'
import { InquirerException } from '../exception/InquirerException'
import { ErrorLogger } from '../logger/Logger'

export class InquirerController {

    private static SPINNER = new Spinner()

    private layerzeroService: LayerZeroService

    constructor() {
        this.layerzeroService = new LayerZeroService()
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
                if (e instanceof InquirerException) {
                    console.log(e.message)
                } else if (e instanceof Error) {
                    ErrorLogger.error(e)
                } else {
                    throw Error("Unexpected error")
                }
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

        console.log("\n[Select the OFTV2 contract deployment options]")

        const oftv2DeployOption = await this.selectDeployOptions(LzContractDepoloySupporters.get("OFTV2")!)

        if (!await this.confirmInput(oftv2DeployOption.confirmMessage)) return

        console.log("\n[Select the other layerzero contract deployment options]")

        const contractType = await this.selectContractTypeWithoutOFTV2()
        const secondDeployOption = await this.selectDeployOptions(contractType, oftv2DeployOption.chain.name)

        if (!await this.confirmInput(secondDeployOption.confirmMessage)) return

        await this.layerzeroService.deployAll(oftv2DeployOption, secondDeployOption)
    }

    public async send() {

        const chain = await this.selectChain()
        const signer = await this.selectSigner(chain)
        const contract = await this.selectContractWithBalance(chain, signer)
        const dstChain = await this.selectDstChain(contract)
        const toAddress = await this.inputToAddress()
        const amount = await this.inputAmount()

        const option = new SendOption(chain, contract, signer, dstChain, toAddress, amount)

        if (!await this.confirmInput(option.confirmMessage)) return

        await this.layerzeroService.send(option)
    }

    private async confirmInput(confirmMessage: string): Promise<boolean> {
        const answer = await confirm({
            message: confirmMessage,
            transformer: (answer) => (answer ? 'Confirm' : 'Cancel')
        })

        if (!answer) console.log("Canceled.")

        return answer
    }

    private async selectDeployOptions(type: ContractDeploySupporter, selectedChain: string | void) {
        const chain = await this.selectChain(selectedChain)
        const signer = await this.selectSigner(chain)
        const args = await this.inputArgs(type)
        args["lzEndpoint"] = chain.lzEndpoint

        return new DeployOption(chain, signer, type, args)
    }

    private async selectChain(selectedChain: string | void): Promise<LzChain> {
        const chainChoices = this.layerzeroService
            .getChains()
            .map((chain) => {
                if (chain.name == selectedChain) {
                    return { name: chain.name, value: chain as LzChain | undefined, disabled: "(Already selected)" }
                }
                return { name: chain.name, value: chain as LzChain | undefined }
            })

        chainChoices.push({ name: "[Cancel]", value: undefined })

        return await select({
            message: 'Which chain do you want?',
            choices: chainChoices
        }).then((value) => {
            if (value == undefined) {
                throw new InquirerException("Canceled.")
            }
            return value
        })
    }

    private async selectSigner(chain: LzChain): Promise<Wallet> {
        const signerChoices = chain.getAccounts()
            .map(account => {
                return { name: account.address, value: account as Wallet | undefined }
            })

        signerChoices.push({ name: "[Cancel]", value: undefined })

        return await select({
            message: 'Which wallet do you want?',
            loop: false,
            choices: signerChoices
        }).then((value) => {
            if (value == undefined) {
                throw new InquirerException("Canceled.")
            }
            return value
        })
    }

    private async selectContractWithBalance(chain: LzChain, wallet: Wallet): Promise<LzContract> {
        const contractChoices = []

        InquirerController.SPINNER.start(`Loading...`)
        for (const contract of chain.getContracts()) {
            contractChoices.push({
                name: `${contract.address}`,
                value: contract as LzContract | undefined,
                description: `\n[contract information]${await contract.printWithBalance(wallet)}`
            })
        }
        InquirerController.SPINNER.succeed(`Done!`)

        contractChoices.push({ name: "[Cancel]", value: undefined })

        return await select({
            message: 'Which contract do you want?',
            loop: false,
            choices: contractChoices
        }).then((value) => {
            if (value == undefined) {
                throw new InquirerException("Canceled.")
            }
            return value
        })
    }

    private async selectContractTypeWithoutOFTV2(): Promise<ContractDeploySupporter> {
        const contractTypeChoices = [...LzContractDepoloySupporters.values()]
            .filter(type => type.name != "OFTV2")
            .map(type => {
                return { name: type.name, value: type as ContractDeploySupporter | undefined }
            })

        contractTypeChoices.push({ name: "[Cancel]", value: undefined })

        return await select({
            message: 'Which ContractType do you want?',
            choices: contractTypeChoices
        }).then((value) => {
            if (value == undefined) {
                throw new InquirerException("Canceled.")
            }
            return value
        })
    }

    private async selectDstChain(contract: LzContract): Promise<LzChain> {
        const dstChainChoices = [...contract.dstChains]
            .map(chain => {
                return { name: chain, value: this.layerzeroService.getChain(chain) as LzChain | undefined }
            })

        dstChainChoices.push({ name: "[Cancel]", value: undefined })

        return await select({
            message: 'Which destination chain do you want?',
            choices: dstChainChoices
        }).then((value) => {
            if (value == undefined) {
                throw new InquirerException("Canceled.")
            }
            return value
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