import { Contract, Provider, Wallet, ethers } from "ethers"

import { LzContract } from "./LzContract"

import ProxyOFTV2abi from "../../constants/abi/ProxyOFTV2_abi.json"
import ERC20Abi from "../../constants/abi/ERC20_abi.json"
import { logger } from "../../logger/logger"

export class ProxyOFTV2Contract extends LzContract {

    public readonly contractType: string = "ProxyOFTV2"
    public readonly abi: any = ProxyOFTV2abi

    private token: string | undefined = undefined
    private tokenName: string | undefined = undefined
    private tokenSymbol: string | undefined = undefined
    private sharedDecimals: number | undefined = undefined

    public static async generateProxyOFTV2(lzChain: string, address: string, dstChains: string[], provider: Provider): Promise<LzContract> {

        const contract = new ProxyOFTV2Contract(lzChain, address, dstChains)

        await contract.init(provider)

        return contract
    }

    public async init(provider: Provider) {

        if (this.token && this.tokenName && this.tokenSymbol && this.sharedDecimals) throw Error("Already initialized!")

        const contract = new Contract(this.address, this.abi, provider)
        this.token = await contract.token()
        this.sharedDecimals = await contract.sharedDecimals()

        if (!this.token) throw Error("Not found ERC20 token!")

        const tokenContract = new Contract(this.token, ERC20Abi, provider)
        this.tokenName = await tokenContract.name()
        this.tokenSymbol = await tokenContract.symbol()
    }

    public async estimateSendFee(signer: Wallet, dstChainId: string, toAddress: string, amount: string): Promise<bigint> {

        const contract = new Contract(this.address, this.abi, signer)
        const toAddressBytes = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [toAddress])
        const fee = await contract.estimateSendFee(dstChainId, toAddressBytes, amount, false, LzContract.DEFAULT_ADAPTER_PARAMS)

        return fee[0]
    }

    public async sendFrom(signer: Wallet, dstChainId: string, toAddress: string, amount: string, estimatedFee: bigint) {

        const contract = new Contract(this.address, this.abi, signer)
        const toAddressBytes = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [toAddress])

        await this.approve(signer, amount)

        const callParams = { refundAddress: signer.address, zroPaymentAddress: signer.address, adapterParams: LzContract.DEFAULT_ADAPTER_PARAMS }

        const receipt = await (await contract.sendFrom(
            signer.address,
            dstChainId,
            toAddressBytes,
            amount,
            callParams,
            { value: estimatedFee }
        )).wait()

        logger.tx(receipt)

        return receipt
    }

    private async approve(signer: Wallet, amount: string) {

        if (!this.token) throw Error("Undefined token address!")

        const tokenCoontract = new Contract(this.token, ERC20Abi, signer)
        const receipt = await (await tokenCoontract.approve(this.address, amount)).wait()

        logger.tx(receipt)
    }

    public print(): string {
        return `
        \r - Address         : ${this.address}
        \r - Type            : ${this.contractType}
        \r - Shared Decimals : ${this.sharedDecimals}
        \r - Token (ERC20)   : ${this.token}
        \r     - name        : ${this.tokenName}
        \r     - symbol      : ${this.tokenSymbol}`
    }

    public async printWithBalance(wallet: Wallet): Promise<string> {

        if (!this.token) throw Error("Undefined token address!")

        const contract = new Contract(this.token, ERC20Abi, wallet)
        const balance = await contract.balanceOf(wallet.address)

        return `${this.print()}
        \r     - Balance     : ${balance}`
    }
}