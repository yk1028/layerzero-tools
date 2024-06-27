export class InquirerException extends Error {
    constructor(message: string) {
        super(message)
        this.name = "InquirerException"
    }
}