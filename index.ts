import * as dotenv from 'dotenv'
import { InquirerController } from './src/Inquirer/InquirerController'

const app = async () => {
    
    dotenv.config()

    const controller = new InquirerController()
    await controller.start();
}

app();