import { ContractFactory } from "ethers"
import { LzContract } from "./LzContract"
import { OFTV2Contract } from "./OFTV2Contract"
import { NativeOFTV2Contract } from "./NativeOFTV2Contract"
import { ProxyOFTV2Contract } from "./ProxyOFTV2Contract"

import OFTV2abi from "../../constants/abi/OFTV2_abi.json"
import NativeOFTV2abi from "../../constants/abi/NativeOFTV2_abi.json"
import ProxyOFTV2abi from "../../constants/abi/ProxyOFTV2_abi.json"

import OFTV2bytecode from "../../constants/bytecode/OFTV2_bytecode.json"
import NativeOFTV2bytecode from "../../constants/bytecode/NativeOFTV2_bytecode.json"
import ProxyOFTV2bytecode from "../../constants/bytecode/ProxyOFTV2_abi.json"

export type LzContractType = {
    name: string
    generator: (...args: any) => LzContract
    factory: ContractFactory
    deployArgs: any[]
}

export const LzContractTypes: Map<string, LzContractType> = new Map<string, LzContractType>([
    [
        "OFTV2", {
            name: "OFTV2",
            generator: (lzChainId, address, dstChains) => new OFTV2Contract(lzChainId, address, dstChains),
            factory: new ContractFactory(OFTV2abi, OFTV2bytecode.bytecode),
            deployArgs: ["name", "symbol", "sharedDecimal"]
        }
    ],
    [
        "NativeOFTV2", {
            name: "NativeOFTV2",
            generator: (lzChainId, address, dstChains) => new NativeOFTV2Contract(lzChainId, address, dstChains),
            factory: new ContractFactory(NativeOFTV2abi, NativeOFTV2bytecode.bytecode),
            deployArgs: ["name", "symbol", "sharedDecimal"]
        }
    ],
    [
        "ProxyOFTV2", {
            name: "ProxyOFTV2",
            generator: (lzChainId, address, dstChains) => new ProxyOFTV2Contract(lzChainId, address, dstChains),
            factory: new ContractFactory(ProxyOFTV2abi, ProxyOFTV2bytecode.bytecode),
            deployArgs: ["tokenAddress", "sharedDecimal"]
        }
    ]
]);