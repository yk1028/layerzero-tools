import { Wallet } from "ethers"
import { Chain } from "../domain/Chain"
import { LzContract } from "../domain/LzContract"

import chainsJson from "../constants/chain.json"
import { LzContractTypes } from "../domain/LzContractType"

export class ChainRepository {
    public readonly chains: Map<string, Chain>

    constructor() {
        this.chains = new Map<string, Chain>()

        chainsJson.chains.forEach(chain => {
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
                    this.resolveWallets(chain["account_key"]),
                    chain["contracts"].flatMap((contract) => new LzContract(
                        contract["address"],
                        LzContractTypes.get(contract["type"])!,
                        contract["dst_chains"]))
                ))
        })
    }

    private resolveWallets(accountKey: string): Wallet[] {
        const accountKeys: string = process.env[accountKey]!
        const accounts: [] = JSON.parse(accountKeys)

        return accounts.flatMap((account) => new Wallet(account))
    }
}