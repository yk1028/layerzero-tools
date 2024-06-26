import { Contract, Signer, TransactionReceipt, Wallet, ethers } from "ethers"
import { Logger } from "../../logger/Logger"

export abstract class LzContract {

    private static readonly SEND_FROM_PACKET_TYPE: number = 0
    private static readonly DEFAULT_MIN_GAS: number = 100000

    protected static readonly DEFAULT_ADAPTER_PARAMS = ethers.solidityPacked(["uint16", "uint256"], [1, 100000])

    public readonly abstract contractType: string
    public readonly abstract abi: any

    constructor(
        public readonly lzChainId: string,
        public readonly address: string,
        public readonly dstChains: string[]
    ) { }

    public async setTrustedRemote(signer: Signer, remoteContract: LzContract) {

        const contract = new Contract(this.address, this.abi, signer)
        const remoteChainId = remoteContract.lzChainId
        const remoteAndLocal = ethers.solidityPacked(["address", "address"], [remoteContract.address, this.address])

        const isTrustedRemoteSet = await contract.isTrustedRemote(remoteChainId, remoteAndLocal)

        if (isTrustedRemoteSet) throw Error("Trusted remote already set.")

        const receipt = await (await contract.setTrustedRemote(remoteChainId, remoteAndLocal)).wait()

        Logger.tx(receipt)

        return receipt
    }

    public async setMinDstGas(signer: Signer, remoteContract: LzContract) {

        const contract = new Contract(this.address, this.abi, signer)
        const remoteLzChainId = remoteContract.lzChainId

        const receipt = await (await contract.setMinDstGas(remoteLzChainId, LzContract.SEND_FROM_PACKET_TYPE, LzContract.DEFAULT_MIN_GAS)).wait()

        Logger.tx(receipt)

        return receipt
    }

    public abstract estimateSendFee(signer: Wallet, dstChainId: string, toAddress: string, amount: string): Promise<bigint>

    public abstract sendFrom(signer: Signer, dstChainId: string, toAddress: string, amount: string, estimatedFee: bigint): Promise<TransactionReceipt>

    public abstract print(): string

    public abstract printWithBalance(wallet: Wallet): Promise<string>
}