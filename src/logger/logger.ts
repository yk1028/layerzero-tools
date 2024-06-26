import { BaseLogger, ILogObjMeta, ILogObj, ISettingsParam } from "tslog"
import { appendFileSync } from "fs"

class CustomLogger<LogObj> extends BaseLogger<LogObj> {
    constructor(settings?: ISettingsParam<LogObj>, logObj?: LogObj) {
        super(settings, logObj, 5);
    }

    public tx(...args: unknown[]): LogObj & ILogObjMeta | undefined {
        return super.log(8, "Transaction", ...args);
    }
}

export const Logger = new CustomLogger({ 
    name: "lz-tool",
    prettyLogTemplate: ""
})

Logger.attachTransport((logObject: ILogObj) => {

    const json = JSON.parse(JSON.stringify(logObject))

    const format = `[${json._meta.date}]\n{
    "to": '${json.to}'
    "from" '${json.from}'
    "contractAddress": '${json.contractAddress}'
    "hash": '${json.hash}'
    "index": ${json.index}
    "blockhash": '${json.blockhash}'
    "blocknumber": ${json.blocknumber}
    "logBloom": '${json.logBloom}'
    "gasUsed": ${json.gasUsed}
    "cumulativeGasUsed": ${json.cumulativeGasUsed}
    "gasPrice": ${json.gasPrice}
    "type": ${json.type}
    "status": ${json.status}\n}`

    appendFileSync("./log/tx.log", format + "\n")
})
