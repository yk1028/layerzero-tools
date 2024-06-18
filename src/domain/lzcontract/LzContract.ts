import { Contract, Signer, TransactionReceipt, ethers } from "ethers"

export abstract class LzContract {

    private readonly SEND_FROM_PACKET_TYPE: number = 0
    private readonly DEFAULT_MIN_GAS: number = 100000

    public abstract contractType: string
    public abstract abi: any

    constructor(
        public readonly lzChainId: string,
        public readonly address: string,
        public readonly dstChains: string[]
    ) { }

    public async setTrustedRemote(signer: Signer, remoteContract: LzContract) {

        const connectedContract = new Contract(this.address, this.abi, signer)

        const remoteChainId = remoteContract.lzChainId
        const remoteAndLocal = ethers.solidityPacked(["address", "address"], [remoteContract.address, this.address])

        const isTrustedRemoteSet = await connectedContract.isTrustedRemote(remoteChainId, remoteAndLocal)

        if (isTrustedRemoteSet) throw Error("Trusted remote already set.")

        const receipt = await (await connectedContract.setTrustedRemote(remoteChainId, remoteAndLocal)).wait()

        console.log(receipt)

        return receipt
    }

    public async setMinDstGas(signer: Signer, remoteContract: LzContract) {

        const connectedContract = new Contract(this.address, this.abi, signer)
        const remoteLzChainId = remoteContract.lzChainId

        const receipt = await (await connectedContract.setMinDstGas(remoteLzChainId, this.SEND_FROM_PACKET_TYPE, this.DEFAULT_MIN_GAS)).wait()

        console.log(receipt)

        return receipt
    }

    public abstract sendFrom(signer: Signer, dstChainId: string, toAddress: string, amount: string): Promise<TransactionReceipt>

}