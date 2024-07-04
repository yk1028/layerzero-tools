import fs from "fs"

import { LzChain } from "../domain/Chain"

import chainsJson from "../constants/chain.json"

export class ChainRepository {
    public readonly chains: Map<string, LzChain>

    constructor() {
        this.chains = new Map<string, LzChain>()

        for (const chain of chainsJson.chains) {

            const lzChainJson: LzChainJson = Object.assign(new LzChainJson(), chain);

            this.chains.set(lzChainJson.chain_name, lzChainJson.toLzChain())
        }
    }

    public saveContract(targetChain: string, contractAddress: string, contractType: string, dstChains: string[]) {

        for (const chain of chainsJson.chains) {

            const chainJson: LzChainJson = Object.assign(new LzChainJson(), chain);

            if (chainJson.chain_name == targetChain) {
                chainJson.contracts.push({
                    "address": contractAddress,
                    "type": contractType,
                    "dst_chains": dstChains
                })
            }
        }

        fs.writeFileSync("./src/constants/chain.json", JSON.stringify(chainsJson))
    }
}

class LzChainJson {
    constructor(
        public readonly chain_name: string = "",
        public readonly chain_id: string = "",
        public readonly native_symbol: string = "",
        public readonly rpc: string = "",
        public readonly explorer: string = "",
        public readonly lz_chain_id: string = "",
        public readonly lz_endpoint: string = "",
        public readonly account_key: string = "",
        public readonly contracts: LzContractJson[] = []
    ) { }

    public toLzChain(): LzChain {

        const lzChain = new LzChain(
            this.chain_name,
            this.chain_id,
            this.native_symbol,
            this.rpc,
            this.explorer,
            this.lz_chain_id,
            this.lz_endpoint
        )

        this.addAccount(lzChain)
        this.addContract(lzChain)

        return lzChain
    }

    private addAccount(lzChain: LzChain) {
        const accountKeys: string = process.env[this.account_key]!
        const accounts: [] = JSON.parse(accountKeys)

        if(accounts.length == 0) throw Error(`Not found any account at ${lzChain.name}`)

        accounts.flatMap((account) => lzChain.addAccount(account))
    }

    private addContract(lzChain: LzChain) {
        this.contracts.flatMap((contract) =>
            lzChain.addContract(contract.type, contract.address, contract.dst_chains)
        )
    }
}

class LzContractJson {
    constructor(
        public readonly type: string = "",
        public readonly address: string = "",
        public readonly dst_chains: string[] = []
    ) { }
}