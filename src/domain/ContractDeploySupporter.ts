import { ContractFactory, ethers } from "ethers"

import OFTV2abi from "../constants/abi/OFTV2_abi.json"
import NativeOFTV2abi from "../constants/abi/NativeOFTV2_abi.json"
import ProxyOFTV2abi from "../constants/abi/ProxyOFTV2_abi.json"

import OFTV2bytecode from "../constants/bytecode/OFTV2_bytecode.json"
import NativeOFTV2bytecode from "../constants/bytecode/NativeOFTV2_bytecode.json"
import ProxyOFTV2bytecode from "../constants/bytecode/ProxyOFTV2_abi.json"

export type ContractDeployArg = {
    name: string,
    validate: (arg: string) => boolean | string | Promise<string | boolean>
}

export type ContractDeploySupporter = {
    name: string
    factory: ContractFactory
    deployArgs: ContractDeployArg[]
}

export const LzContractDepoloySupporters: Map<string, ContractDeploySupporter> = new Map<string, ContractDeploySupporter>([
    [
        "OFTV2", {
            name: "OFTV2",
            factory: new ContractFactory(OFTV2abi, OFTV2bytecode.bytecode),
            deployArgs: [
                { name: "name", validate: (input: string) => { return input == "" ? "(Can not be empty.)" : true } },
                { name: "symbol", validate: (input: string) => { return input == "" ? "(Can not be empty.)" : true } },
                {
                    name: "sharedDecimals", validate: (input: string) => {
                        if (input == "6" || input == "18") return true
                        else return "(6 or 18)"
                    }
                }
            ]
        }
    ],
    [
        "NativeOFTV2", {
            name: "NativeOFTV2",
            factory: new ContractFactory(NativeOFTV2abi, NativeOFTV2bytecode.bytecode),
            deployArgs: [
                { name: "name", validate: (input: string) => { return input == "" ? "(Can not be empty.)" : true } },
                { name: "symbol", validate: (input: string) => { return input == "" ? "(Can not be empty.)" : true } },
                {
                    name: "sharedDecimals", validate: (input: string) => {
                        if (input == "6" || input == "18") return true
                        return "(6 or 18)"
                    }
                }
            ]
        }
    ],
    [
        "ProxyOFTV2", {
            name: "ProxyOFTV2",
            factory: new ContractFactory(ProxyOFTV2abi, ProxyOFTV2bytecode.bytecode),
            deployArgs: [
                {
                    name: "toeknAddress", validate: (input: string) => {
                        if (ethers.isAddress(input)) return true
                        return "(Invalid Address)"
                    }
                },
                {
                    name: "sharedDecimals", validate: (input: string) => {
                        if (input == "6" || input == "18") return true
                        return "(6 or 18)"
                    }
                }
            ]
        }
    ]
]);