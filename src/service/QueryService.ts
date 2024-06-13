import { ChainRepository } from "../repository/ChainRepository";

export class QueryService {
    private repository: ChainRepository

    constructor() {
        this.repository = new ChainRepository()
    }

    public queryChains(): void {
        const chains = [...this.repository.chains.values()];

        chains.forEach(chain => console.log(chain))
    }

    public queryAccounts(): void {
        const chains = [...this.repository.chains.values()];
        chains.forEach(chain => {
            console.log(chain.name)
            chain.accounts.forEach(account => console.log(` - ${account.address}`))
        })
    }

    public queryContracts(): void {
        const chains = [...this.repository.chains.values()];
        chains.forEach(chain => {
            console.log(`[${chain.name}]`)
            chain.contracts.forEach((contract, i) => {
                console.log(` [${i}]`)
                console.log(`  address:   ${contract.address}`)
                console.log(`  type:      ${contract.type.name}`)
                console.log(`  dstchains: ${contract.dstChains}`)
            })
            console.log("===============================================")
        })
    }
}