import OFTV2abi from "../constants/abi/OFTV2_abi.json"
import NativeOFTV2abi from "../constants/abi/NativeOFTV2_abi.json"
import ProxyOFTV2abi from "../constants/abi/ProxyOFTV2_abi.json"

import OFTV2bytecode from "../constants/bytecode/OFTV2_bytecode.json"
import NativeOFTV2bytecode from "../constants/bytecode/NativeOFTV2_bytecode.json"
import ProxyOFTV2bytecode from "../constants/bytecode/ProxyOFTV2_abi.json"

import { ContractFactory } from "ethers"

export type LzContractType = {
    name: string
    abi: any
    factory: ContractFactory
    deployArgs: any[]
}

export const LzContractTypes: Map<string, LzContractType> = new Map<string, LzContractType>([
    [
        "OFTV2", {
            name: "OFTV2",
            abi: OFTV2abi,
            factory: new ContractFactory(OFTV2abi, OFTV2bytecode.bytecode),
            deployArgs: ["name", "symbol", "sharedDecimal"]
        }
    ],
    [
        "NativeOFTV2", {
            name: "NativeOFTV2",
            abi: NativeOFTV2abi,
            factory: new ContractFactory(NativeOFTV2abi, NativeOFTV2bytecode.bytecode),
            deployArgs: ["name", "symbol", "sharedDecimal"]
        }
    ],
    [
        "ProxyOFTV2", {
            name: "ProxyOFTV2",
            abi: ProxyOFTV2abi,
            factory: new ContractFactory(ProxyOFTV2abi, ProxyOFTV2bytecode.bytecode),
            deployArgs: ["tokenAddress", "sharedDecimal"]
        }
    ]
]);