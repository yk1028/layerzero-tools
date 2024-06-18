import { Signer, ethers } from "ethers";
import { LzContract } from "./LzContract";

export class ProxyOFTV2Contract extends LzContract {

    public contractType: string = "ProxyOFTV2"

    // todo: allow ERC20 
    public async sendFrom(signer: Signer, dstChainId: string, toAddress: string, amount: string) {
        const contract = this.contract.connect(signer)
        const fromAddress = signer.getAddress()
        const toAddressBytes = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [toAddress])
        const defaultAdapterParams = ethers.solidityPacked(["uint16", "uint256"], [1, 100000])
        const fee = await contract.getFunction("estimateSendFee").call(dstChainId, toAddressBytes, amount, false, defaultAdapterParams)

        console.log(`fees: ${fee[0]}`)

        const callParams = { refundAddress: fromAddress, zroPaymentAddress: fromAddress, adapterParams: defaultAdapterParams }

        return (await contract.getFunction("sendFrom").call(
            fromAddress,
            dstChainId,
            toAddressBytes,
            amount,
            callParams,
            { value: ethers.parseEther(fee[0]) }
        )).wait()
    }
}