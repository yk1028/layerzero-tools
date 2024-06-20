import { Contract, Provider, Wallet, ethers } from "ethers";

import { LzContract } from "./LzContract";

import OFTV2abi from "../../constants/abi/OFTV2_abi.json"

export class OFTV2Contract extends LzContract {

    public readonly contractType: string = "OFTV2"
    public readonly abi: any = OFTV2abi

    private name: string | undefined = undefined
    private symbol: string | undefined = undefined
    private sharedDecimals: number | undefined = undefined

    public static async generateOFTV2(lzChain: string, address: string, dstChains: string[], provider: Provider): Promise<LzContract> {
        const contract = new OFTV2Contract(lzChain, address, dstChains)
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

    public async sendFrom(signer: Wallet, dstChainId: string, toAddress: string, amount: string) {

        const contract = new Contract(this.address, this.abi, signer)
        const toAddressBytes = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [toAddress])
        const fee = await contract.estimateSendFee(dstChainId, toAddressBytes, amount, false, LzContract.DEFAULT_ADAPTER_PARAMS)

        console.log(`fees: ${fee[0]}`)

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
}