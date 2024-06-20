import { Contract, Provider, Wallet, ethers } from "ethers"

import { LzContract } from "./LzContract"

import ProxyOFTV2abi from "../../constants/abi/ProxyOFTV2_abi.json"
import ApproveAbi from "../../constants/abi/Approve_abi.json"

export class ProxyOFTV2Contract extends LzContract {

    public readonly contractType: string = "ProxyOFTV2"
    public readonly abi: any = ProxyOFTV2abi

    private token: string | undefined = undefined
    private sharedDecimals: number | undefined = undefined

    public static async generateProxyOFTV2(lzChain: string, address: string, dstChains: string[], provider: Provider): Promise<LzContract> {
        const contract = new ProxyOFTV2Contract(lzChain, address, dstChains)
        await contract.init(provider)
        
        return contract
    }

    public async init(provider: Provider) {
        if (this.token && this.sharedDecimals) throw Error("Already initialized!")

        const contract = new Contract(this.address, this.abi, provider)

        this.token = await contract.token()
        this.sharedDecimals = await contract.sharedDecimals()
    }

    public async sendFrom(signer: Wallet, dstChainId: string, toAddress: string, amount: string) {

        const contract = new Contract(this.address, this.abi, signer)
        const toAddressBytes = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [toAddress])
        const fee = await contract.estimateSendFee(dstChainId, toAddressBytes, amount, false, LzContract.DEFAULT_ADAPTER_PARAMS)

        console.log(`fees: ${fee[0]}`)

        await this.approve(signer, amount)

        const callParams = { refundAddress: signer.address, zroPaymentAddress: signer.address, adapterParams: LzContract.DEFAULT_ADAPTER_PARAMS }

        const receipt = await (await contract.sendFrom(
            signer.address,
            dstChainId,
            toAddressBytes,
            amount,
            callParams,
            { value: fee[0] }
        )).wait()

        console.log(receipt)

        return receipt
    }

    private async approve(signer: Wallet, amount: string) {

        if (!this.token) throw Error("Undefined token address!")
        
        const tokenCoontract = new Contract(this.token, ApproveAbi, signer)
        const receipt = await (await tokenCoontract.approve(this.address, amount)).wait()
        
        console.log(receipt)
    }
}