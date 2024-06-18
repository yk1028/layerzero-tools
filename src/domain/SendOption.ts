import { Signer } from "ethers";
import { LzContract } from "./lzcontract/LzContract";

export class SendOption {
    constructor(
        contract: LzContract,
        signer: Signer,
        dstLzChainId: string,
        toAddress: string,
        amount: string
    ) { }
}