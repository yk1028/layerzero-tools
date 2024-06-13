import select, { Separator } from '@inquirer/select'
import { QueryService } from '../service/QueryService'

export class InquirerController {

    private queryService: QueryService

    constructor() {
        this.queryService = new QueryService()
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
                    console.log('not yet')
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
}