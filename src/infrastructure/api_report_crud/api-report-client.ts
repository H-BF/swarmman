import { RestClient } from "../axios/rest-client"
import { variables } from "../variable_storage/variable-storage"
import { IAssertionReq, IAssertionRes } from "./interfaces/assertion.interface"
import { ICreateLaunchReq, ICreateLaunchRes, IUpdateLaunchReq, IUpdateLaunchRes } from "./interfaces/launch.interface"
import { IExecutionReq, IExecutionRes, IExecutionUpdReq, IExecutionUpdRes } from "./interfaces/execution.interface"
import { IJsonSchemaReq, IJsonSchemaRes } from "./interfaces/json-schema.interface"
import { IRequestReq, IRequestRes } from "./interfaces/request.interface"
import { IResponseReq, IResponseRes } from "./interfaces/response.interface"
import { ICreateLaunchErrorReq } from "./interfaces/create-launch-err.interface"

export class ApiReporterClient extends RestClient {

    constructor() {
        super({
            baseUrl: variables.REPORTER_HOST,
            port: variables.REPORTER_PORT,
            protocol: variables.REPORTER_PROTOCOL
        })
        this.defaults.baseURL += '/api/v1'
    }

    async createLaunch(launch: ICreateLaunchReq): Promise<string> {
        const { data } = await this.post<ICreateLaunchRes>('/launch', launch)
        return data.uuid
    }

    async updateLaunch(launch: IUpdateLaunchReq): Promise<IUpdateLaunchRes> {
        const { data } = await this.patch<IUpdateLaunchRes>('/launch', launch)
        return data
    }

    async createRequest(request: IRequestReq): Promise<string> {
        const { data } =  await this.post<IRequestRes>('/request', request)
        return data.uuid
    }

    async createResponse(response: IResponseReq): Promise<string> {
        const { data } = await this.post<IResponseRes>('/response', response)
        return data.uuid
    }

    async createExecution(execution: IExecutionReq): Promise<string> {
        const { data } = await this.post<IExecutionRes>('/execution', execution)
        return  data.uuid
    }

    async updateExecution(execution: IExecutionUpdReq): Promise<IExecutionUpdRes> {
        const { data } = await this.patch<IExecutionUpdRes>('/execution', execution)
        return data
    }

    async createAssertions(assertions: IAssertionReq[]): Promise<number> {
        const { data } = await this.post<IAssertionRes>('/assertions', assertions)
        return data.count
    }

    async createJsonSchema(jsonSchema: IJsonSchemaReq): Promise<string> {
        const { data } = await this.post<IJsonSchemaRes>('/json_schema', jsonSchema)
        return data.uuid
    }
    
    async createLaunchError(launchError: ICreateLaunchErrorReq): Promise<void> {
        await this.post('/launch_error', launchError)
    } 
}