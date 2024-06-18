import { Contract, Signer, TransactionReceipt, ethers } from "ethers"

export abstract class LzContract {

    private readonly SEND_FROM_PACKET_TYPE: number = 0
    private readonly DEFAULT_MIN_GAS: number = 100000

    public abstract contractType: string

    constructor(
        public readonly lzChainId: string,
        public readonly contract: Contract,
        public readonly dstChains: string[]
    ) { }

    public async setTrustedRemote(signer: Signer, remoteContract: LzContract) {

        const connectedContract = this.contract.connect(signer)

        const remoteChainId = remoteContract.lzChainId
        const remoteAndLocal = ethers.solidityPacked(["address", "address"], [remoteContract.contract.address, this.contract.address])

        const isTrustedRemoteSet = await connectedContract.getFunction("isTrustedRemote").call(remoteChainId, remoteAndLocal)

        if (isTrustedRemoteSet) throw Error("Trusted remote already set.")

        const receipt = await (await connectedContract.getFunction("setTrustedRemote").call(remoteChainId, remoteAndLocal)).wait()

        console.log(receipt)

        return receipt
    }

    public async setMinDstGas(signer: Signer, remoteContract: LzContract) {

        const connectedContract = this.contract.connect(signer)
        const remoteLzChainId = remoteContract.lzChainId

        const receipt = await (await connectedContract.getFunction("setMinDstGas").call(remoteLzChainId, this.SEND_FROM_PACKET_TYPE, this.DEFAULT_MIN_GAS)).wait()

        console.log(receipt)

        return receipt
    }

    public abstract sendFrom(signer: Signer, dstChainId: string, toAddress: string, amount: string): Promise<TransactionReceipt>

}