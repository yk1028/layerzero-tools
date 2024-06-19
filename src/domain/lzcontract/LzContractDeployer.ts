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

export type LzContractDeployer = {
    name: string
    factory: ContractFactory
    deployArgs: any[]
}

export const LzContractDepoloyers: Map<string, LzContractDeployer> = new Map<string, LzContractDeployer>([
    [
        "OFTV2", {
            name: "OFTV2",
            factory: new ContractFactory(OFTV2abi, OFTV2bytecode.bytecode),
            deployArgs: ["name", "symbol", "sharedDecimal"]
        }
    ],
    [
        "NativeOFTV2", {
            name: "NativeOFTV2",
            factory: new ContractFactory(NativeOFTV2abi, NativeOFTV2bytecode.bytecode),
            deployArgs: ["name", "symbol", "sharedDecimal"]
        }
    ],
    [
        "ProxyOFTV2", {
            name: "ProxyOFTV2",
            factory: new ContractFactory(ProxyOFTV2abi, ProxyOFTV2bytecode.bytecode),
            deployArgs: ["tokenAddress", "sharedDecimal"]
        }
    ]
]);