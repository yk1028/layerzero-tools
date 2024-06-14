import select from '@inquirer/select'
import { QueryService } from '../service/QueryService'
import { ChainRepository } from '../repository/ChainRepository'
import { Chain } from '../domain/Chain'
import { Wallet } from 'ethers'
import { LzContractType, LzContractTypes } from '../domain/LzContractType'
import { confirm, input } from '@inquirer/prompts'
import { LayerZeroService } from '../service/LayerZeroService'
import { DeployOption } from '../domain/DeployOption'
import { LzContract } from '../domain/LzContract'

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

        console.log(`[${firstDeployOption.chain.name}] Deploying contract...`)
        const firstDeployRecipt = await this.layerzeroService.deploy(firstDeployOption)
        const firstContract = new LzContract(firstDeployOption.chain.lzChainId, firstDeployRecipt?.contractAddress!, firstDeployOption.contractType, [firstDeployOption.chain.name])

        console.log(`[${secondDeployOption.chain.name}] Deploying contract...`)
        const secondDeployRecipt = await this.layerzeroService.deploy(secondDeployOption)
        const secondContract = new LzContract(secondDeployOption.chain.lzChainId, secondDeployRecipt?.contractAddress!, secondDeployOption.contractType, [secondDeployOption.chain.name])

        console.log(`setTruestRemote [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await this.layerzeroService.setTrustedRemote(firstDeployOption.signer, firstContract, secondContract)

        console.log(`setTruestRemote [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await this.layerzeroService.setTrustedRemote(secondDeployOption.signer, secondContract, firstContract)

        console.log(`setMinDstGas [${firstDeployOption.chain.name}] -> [${secondDeployOption.chain.name}]`)
        await this.layerzeroService.setMinDstGas(firstDeployOption.signer, firstContract, secondContract)

        console.log(`setMinDstGas [${secondDeployOption.chain.name}] -> [${firstDeployOption.chain.name}]`)
        await this.layerzeroService.setMinDstGas(secondDeployOption.signer, secondContract, firstContract)

        console.log("Success!!!")
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

    private async inputArgs(contractType: LzContractType) {
        let inputArgs: any = {}

        for (const arg of contractType.deployArgs) {
            inputArgs[arg] = await input({ message: `Enter ${arg}:` })
        }

        return inputArgs
    }
}