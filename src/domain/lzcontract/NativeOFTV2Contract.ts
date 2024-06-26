import { Contract, Provider, Wallet, ethers } from "ethers"

import { LzContract } from "./LzContract"

import NativeOFTV2abi from "../../constants/abi/NativeOFTV2_abi.json"
import { logger } from "../../logger/logger"

export class NativeOFTV2Contract extends LzContract {

    public readonly contractType: string = "NativeOFTV2"
    public readonly abi: any = NativeOFTV2abi

    private name: string | undefined = undefined
    private symbol: string | undefined = undefined
    private sharedDecimals: number | undefined = undefined

    public static async generateNativeOFTV2(lzChain: string, address: string, dstChains: string[], provider: Provider): Promise<LzContract> {

        const contract = new NativeOFTV2Contract(lzChain, address, dstChains)

        await contract.init(provider)
        
        return contract
    }

    public async init(provider: Provider) {

        if (this.name && this.symbol && this.sharedDecimals) throw Error("Already initialized!")

        const contract = new Contract(this.address, this.abi, provider)

        this.name = await contract.name()
        this.symbol = await contract.symbol()
        this.sharedDecimals = await contract.sharedDecimals()
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

        const callParams = { refundAddress: signer.address, zroPaymentAddress: signer.address, adapterParams: LzContract.DEFAULT_ADAPTER_PARAMS }

        const receipt = await (await contract.sendFrom(
            signer.address,
            dstChainId,
            toAddressBytes,
            amount,
            callParams,
            { value: BigInt(estimatedFee) + BigInt(amount) }
        )).wait()

        logger.tx(receipt)

        return receipt
    }

    public print(): string {
        return `
        \r - Address         : ${this.address}
        \r - Type            : ${this.contractType}
        \r - Name            : ${this.name}
        \r - Symbol          : ${this.symbol}
        \r - Shared Decimals : ${this.sharedDecimals}`
    }

    public async printWithBalance(wallet: Wallet): Promise<string> {
        const contract = new Contract(this.address, this.abi, wallet)
        const balance = await contract.balanceOf(wallet.address)
        return `${this.print()}
        \r - Balance         : ${balance}`
    }
}