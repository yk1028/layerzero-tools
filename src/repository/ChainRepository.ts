import fs from "fs"

import { LzChain } from "../domain/Chain"

import chainsJson from "../constants/chain.json"

export class ChainRepository {
    public readonly chains: Map<string, LzChain>

    constructor() {
        this.chains = new Map<string, LzChain>()

        chainsJson.chains.forEach(chain => {

            const lzChain = new LzChain(
                chain["chain_name"],
                chain["chain_id"],
                chain["native_symbol"],
                chain["rpc"],
                chain["explorer"],
                chain["lz_chain_id"],
                chain["lz_endpoint"],
            )

            this.addWalletsToChain(chain["account_key"], lzChain)

            chain["contracts"].flatMap((contract) =>
                lzChain.addContract(contract["type"], contract["address"], contract["dst_chains"])
            )

            this.chains.set(chain["chain_name"], lzChain)
        })
    }

    private addWalletsToChain(accountKey: string, chain: LzChain) {
        const accountKeys: string = process.env[accountKey]!
        const accounts: [] = JSON.parse(accountKeys)

        accounts.flatMap((account) => chain.addAccount(account))
    }

    public saveContract(targetChain: string, contractAddress: string, contractType: string, dstChains: string[]) {
        chainsJson.chains.forEach((chain) => {
            if (chain.chain_name == targetChain) {
                chain.contracts.push({
                    address: contractAddress,
                    type: contractType,
                    dst_chains: dstChains
                })
            }
        })

        fs.writeFileSync("./src/constants/chain.json", JSON.stringify(chainsJson))
    }
}