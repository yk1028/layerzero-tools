import select from '@inquirer/select'
import { QueryService } from '../service/QueryService'
import { ChainRepository } from '../repository/ChainRepository'
import { Chain } from '../domain/Chain'
import { Contract, Wallet } from 'ethers'
import { LzContractType, LzContractTypes } from '../domain/lzcontract/LzContractType'
import { confirm, input } from '@inquirer/prompts'
import { LayerZeroService } from '../service/LayerZeroService'
import { DeployOption } from '../domain/DeployOption'
import { LzContract } from '../domain/lzcontract/LzContract'
import { SendOption } from '../domain/SendOption'

export class InquirerController {

    private queryService: QueryService
    private layerzeroService: LayerZeroService

    constructor() {
        const repository = new ChainRepository();
        this.queryService = new QueryService(repository)
        this.layerzeroService = new LayerZeroService()
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
            ]
        })

        switch (selectInfo) {
            case 'chains':
                this.queryService
                    .queryChains()
                break
            case 'accounts':
                this.queryService
                    .queryAccounts()
                break
            case 'contracts':
                this.queryService
                    .queryContracts()
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

        const secondDeployOption = await this.selectDeployOptions()

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
        const contract = await this.selectContract(chain)
        const dstChainId = await this.selectDstChainId(contract)
        const toAddress = await this.inputToAddress()
        const amount = await this.inputAmount()

        const option = new SendOption(contract, signer, dstChainId, toAddress, amount)

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

    private async selectDeployOptions() {
        const chain = await this.selectChain()
        const signer = await this.selectSigner(chain)
        const contractType = await this.selcetContractType()
        const args = await this.inputArgs(contractType)
        args["lzEndpoint"] = chain.lzEndpoint

        return new DeployOption(chain, signer, contractType, args)
    }

    private async selectChain(): Promise<Chain> {
        const chainChoices = this.queryService
            .getChains()
            .map((chain) => {
                return { name: chain.name, value: chain }
            })

        return await select({
            message: 'Which chain do you want?',
            choices: chainChoices
        })
    }

    private async selectSigner(chain: Chain): Promise<Wallet> {
        const signerChoices = chain.accounts
            .map(account => {
                return { name: account.address, value: account }
            })

        return await select({
            message: 'Which wallet do you want?',
            choices: signerChoices
        })
    }

    private async selectContract(chain: Chain): Promise<LzContract> {
        const contractChoices = chain.contracts
            .map(contract => {
                return { name: `${contract.address} (${contract.contractType})`, value: contract }
            })

        return await select({
            message: 'Which contract do you want?',
            choices: contractChoices
        })
    }

    private async selcetContractType(): Promise<LzContractType> {
        const contractTypeChoices = [...LzContractTypes.values()]
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
                return { name: chain, value: this.queryService.getChain(chain).lzChainId }
            })

        return await select({
            message: 'Which dstChain do you want?',
            choices: dstChainChoices
        })
    }

    private async inputArgs(contractType: LzContractType) {
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