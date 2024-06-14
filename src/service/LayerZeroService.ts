import { Contract, Wallet, ethers } from "ethers";
import { LzContract } from "../domain/LzContract";
import { DeployOption } from "../domain/DeployOption";

export class LayerZeroService {

    private readonly SEND_FROM_PACKET_TYPE: number = 0
    private readonly DEFAULT_MIN_GAS: number = 100000

    constructor() { }

    public async deploy(option: DeployOption) {

        const factory = option.contractType.factory

        const deployTx = await factory.getDeployTransaction(...option.depolyArgs);

        const receipt = await (await option.signer.sendTransaction(deployTx)).wait();

        console.log(receipt)

        return receipt
    }

    public async setTrustedRemote(signer: Wallet, localContract: LzContract, remoteContract: LzContract) {

        const contract: Contract = localContract.getContractWithSigner(signer)
        const remoteChainId = remoteContract.lzChainId
        const remoteAndLocal = ethers.solidityPacked(["address", "address"], [remoteContract.address, localContract.address])

        const isTrustedRemoteSet = await contract.isTrustedRemote(remoteChainId, remoteAndLocal)

        if (isTrustedRemoteSet) throw Error("Trusted remote already set.")

        const receipt = await (await contract.setTrustedRemote(remoteChainId, remoteAndLocal)).wait()

        console.log(receipt)

        return receipt
    }

    public async setMinDstGas(signer: Wallet, localContract: LzContract, remoteContract: LzContract) {

        const contract: Contract = localContract.getContractWithSigner(signer)
        const remoteLzChainId = remoteContract.lzChainId

        const receipt = await (await contract.setMinDstGas(remoteLzChainId, this.SEND_FROM_PACKET_TYPE, this.DEFAULT_MIN_GAS)).wait()

        console.log(receipt)

        return receipt
    }
}