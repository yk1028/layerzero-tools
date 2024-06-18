import fs from "fs"
import { JsonRpcProvider, Provider, Wallet } from "ethers"

import { Chain } from "../domain/Chain"
import { LzContractTypes } from "../domain/lzcontract/LzContractType"

import chainsJson from "../constants/chain.json"

export class ChainRepository {
    public readonly chains: Map<string, Chain>

    constructor() {
        this.chains = new Map<string, Chain>()

        chainsJson.chains.forEach(chain => {
            const provider = new JsonRpcProvider(chain["rpc"])
            this.chains.set(
                chain["chain_name"],
                new Chain(
                    chain["chain_name"],
                    chain["chain_id"],
                    chain["native_symbol"],
                    chain["rpc"],
                    chain["explorer"],
                    chain["lz_chain_id"],
                    chain["lz_endpoint"],
                    this.resolveWallets(chain["account_key"], provider),
                    chain["contracts"].flatMap((contract) =>
                        LzContractTypes.get(contract["type"])!.generator.apply(null, [chain["lz_chain_id"], contract["address"], contract["dst_chains"]])
                    ))
            )
        })
    }

    private resolveWallets(accountKey: string, provider: Provider): Wallet[] {
        const accountKeys: string = process.env[accountKey]!
        const accounts: [] = JSON.parse(accountKeys)

        return accounts.flatMap((account) => new Wallet(account, provider))
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

        fs.writeFileSync("./src/constants/chain.json" , JSON.stringify(chainsJson))
    }
}