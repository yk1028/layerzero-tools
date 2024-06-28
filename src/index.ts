import * as dotenv from 'dotenv'
import { InquirerController } from './inquirer/InquirerController'
import { existsSync, mkdirSync } from "fs"

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () { return this.toString(); }

const app = async () => {

    if (!existsSync("./log")) {
        mkdirSync("./log")
    }

    dotenv.config({ path: __dirname + '/.env' })

    const controller = new InquirerController()
    await controller.start();
}

app();

