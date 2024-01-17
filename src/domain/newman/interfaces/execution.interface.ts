import { IAssertion } from "./assertion.interface"
import { IRequest } from "./request.interface"
import { IResponse } from "./response.interface"

export interface IExecution {
    name: string
    status: string
    request: IRequest
    response: IResponse
    assertions: IAssertion[]
}