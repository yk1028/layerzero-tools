import { Contract, Provider, Wallet, ethers } from "ethers"

import { LzContract } from "../domain/lzcontract/LzContract";
import { OFTV2Contract } from "./lzcontract/OFTV2Contract";
import { NativeOFTV2Contract } from "./lzcontract/NativeOFTV2Contract";
import { ProxyOFTV2Contract } from "./lzcontract/ProxyOFTV2Contract";

import ProxyOFTV2abi from "../constants/abi/ProxyOFTV2_abi.json"

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

    public async addAccount(address: string) {
        this.accounts.push(new Wallet(address, this.provider))
    }

    public async addContract(contractType: string, address: string, dstChains: string[]): Promise<LzContract> {
        switch (contractType) {
            case 'OFTV2':
                const oftv2Contract = new OFTV2Contract(this.lzChainId, address, dstChains)
                this.contracts.push(oftv2Contract)
                return oftv2Contract

            case 'NativeOFTV2':
                const nativeoftv2Contract = new NativeOFTV2Contract(this.lzChainId, address, dstChains)
                this.contracts.push(nativeoftv2Contract)
                return nativeoftv2Contract

            case 'ProxyOFTV2':
                const contract = new Contract(address, ProxyOFTV2abi, this.provider)
                const proxyOFTV2 = new ProxyOFTV2Contract(this.lzChainId, address, dstChains)
                const tokenAddress = await contract.token()
                proxyOFTV2.setTokenAddress(tokenAddress)
                this.contracts.push(proxyOFTV2)
                return proxyOFTV2

            default:
                throw Error(`not supported contract type ${contractType}`)
        }
    }
}