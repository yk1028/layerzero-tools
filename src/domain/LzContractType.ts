import OFTV2abi from "../constants/abi/OFTV2_abi.json"
import NativeOFTV2abi from "../constants/abi/NativeOFTV2_abi.json"
import ProxyOFTV2abi from "../constants/abi/ProxyOFTV2_abi.json"

export type LzContractType = {
    name: string
    abi: any
}

export const LzContractTypes: Map<string, LzContractType> = new Map<string, LzContractType>([
    [
        "OFTV2", {
            name: "OFTV2",
            abi: OFTV2abi
        }
    ],
    [
        "NativeOFTV2", {
            name: "NativeOFTV2",
            abi: NativeOFTV2abi
        }
    ],
    [
        "ProxyOFTV2", {
            name: "ProxyOFTV2",
            abi: ProxyOFTV2abi
        }
    ]
]);