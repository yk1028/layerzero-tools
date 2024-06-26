import * as dotenv from 'dotenv'
import { InquirerController } from './inquirer/InquirerController'

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () { return this.toString(); }

const app = async () => {

    dotenv.config({ path: __dirname + '/.env' })

    const controller = new InquirerController()
    await controller.start();
}

app();

