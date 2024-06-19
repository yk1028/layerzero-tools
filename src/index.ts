import * as dotenv from 'dotenv'
import { InquirerController } from './inquirer/InquirerController'

const app = async () => {

    dotenv.config({ path: __dirname + '/.env' })

    const controller = new InquirerController()
    await controller.start();
}

app();

