import { LzChain } from "../domain/Chain"
import { ChainRepository } from "../repository/ChainRepository"

export class QueryService {

    constructor(private repository: ChainRepository) { }

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

    public queryAccounts(): void {
        const chains = [...this.repository.chains.values()]
        chains.forEach(chain => {
            console.log(chain.name)
            chain.getAccounts().forEach(account => console.log(` - ${account.address}`))
        })
    }

    public queryContracts(): void {
        const chains = [...this.repository.chains.values()]
        chains.forEach(chain => {
            console.log(`[${chain.name}]`)
            chain.getContracts().forEach((contract, i) => {
                console.log(` [${i}]`)
                console.log(`  address:   ${contract.address}`)
                console.log(`  type:      ${contract.contractType}`)
                console.log(`  dstchains: ${contract.dstChains}`)
            })
            console.log("===============================================")
        })
    }
}