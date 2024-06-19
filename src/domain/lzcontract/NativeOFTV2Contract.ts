import { Contract, Wallet, ethers } from "ethers";

import { LzContract } from "./LzContract";

import NativeOFTV2abi from "../../constants/abi/NativeOFTV2_abi.json"

export class NativeOFTV2Contract extends LzContract {

    public readonly contractType: string = "NativeOFTV2"
    public readonly abi: any = NativeOFTV2abi

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
            { value: BigInt(fee[0]) + BigInt(amount) }
        )).wait()

        console.log(receipt)

        return receipt
    }
}