import { Provider, Wallet, ethers } from "ethers"

import { LzContract } from "../domain/lzcontract/LzContract";
import { OFTV2Contract } from "./lzcontract/OFTV2Contract";
import { NativeOFTV2Contract } from "./lzcontract/NativeOFTV2Contract";
import { ProxyOFTV2Contract } from "./lzcontract/ProxyOFTV2Contract";

export class LzChain {

    private readonly provider: Provider
    private readonly accounts: Wallet[]
    private readonly contracts: LzContract[]

    constructor(
        public readonly name: string,
        public readonly chainId: string,
        public readonly nativeSymbol: string,
        public readonly rpc: string,
        public readonly explorer: string,
        public readonly lzChainId: string,
        public readonly lzEndpoint: string
    ) {
        this.provider = new ethers.JsonRpcProvider(rpc)
        this.accounts = []
        this.contracts = []
    }

    public getAccounts() {
        return this.accounts
    }

    public getContracts() {
        return this.contracts
    }

    public addAccount(address: string) {
        this.accounts.push(new Wallet(address, this.provider))
    }

    public async addContract(contractType: string, address: string, dstChains: string[]): Promise<LzContract> {
        switch (contractType) {
            case 'OFTV2':
                const oftv2Contract = await OFTV2Contract.generateOFTV2(this.lzChainId, address, dstChains, this.provider)
                this.contracts.push(oftv2Contract)
                return oftv2Contract

            case 'NativeOFTV2':
                const nativeOFTV2Contract = await NativeOFTV2Contract.generateNativeOFTV2(this.lzChainId, address, dstChains, this.provider)
                this.contracts.push(nativeOFTV2Contract)
                return nativeOFTV2Contract

            case 'ProxyOFTV2':
                const proxyOFTV2Contract = await ProxyOFTV2Contract.generateProxyOFTV2(this.lzChainId, address, dstChains, this.provider)
                this.contracts.push(proxyOFTV2Contract)
                return proxyOFTV2Contract

            default:
                throw Error(`not supported contract type ${contractType}`)
        }
    }

    public printChain(): string {
        return `[${this.name}]
        \r - Chain Id            : ${this.chainId}
        \r - Native Symbol       : ${this.nativeSymbol}
        \r - Rpc                 : ${this.rpc}
        \r - Explorer            : ${this.explorer}
        \r - LayerZero Chain Id  : ${this.lzChainId}
        \r - LazyerZero Endpoint : ${this.lzEndpoint}        
        `
    }

    public printAccounts(): string {
        let print = `[${this.name} (${this.accounts.length} accounts)]\n`

        for (let i = 0; i < this.accounts.length; i++) {
            print += `${i + 1}.${this.accounts[i].address}\n`

        }
        return print
    }

    public printContracts(): string {
        let print = `[${this.name} (${this.contracts.length} contacts)]\n`

        for (let i = 0; i < this.contracts.length; i++) {
            print += `\n[${i + 1}]${this.contracts[i].print()}\n`

        }
        return print
    }
}