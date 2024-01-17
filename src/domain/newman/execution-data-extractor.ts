import { NewmanRunExecution } from "newman";
import { IRequest } from "./interfaces/request.interface";
import { IResponse } from "./interfaces/response.interface";
import { IAssertion } from "./interfaces/assertion.interface";

export class ExecutionDataExecutor {

    private execution: NewmanRunExecution
    private jsonSchemas: Record<string, string>
    private ValidationTestName = "Validate response JSON schema"

    constructor(
        execution: NewmanRunExecution,
        jsonSchemas: Record<string, string>
    ) {
        this.execution = execution
        this.jsonSchemas = jsonSchemas
    }

    private buildURL(): string {
        const url = this.execution.request.url
        return `${url.protocol}://${url.getHost()}:${url.port}${url.getPath()}`
    }

    private buildRequestBody(): JSON {
        let body: string | undefined
        const request = this.execution.request
        if (request.hasOwnProperty('body')) {
            body = request.body?.raw
        }
        return JSON.parse(body || '{}')
    }

    private buildResponseBody(): JSON {
        let body: string | undefined
        const response = this.execution.response
        if(response.hasOwnProperty('stream')) {
            body = (response.stream as Buffer).toString()
        }
        return JSON.parse(body || '{}')
    }

    private buildResponseHeader(): JSON {
        let headerResult = ""
        const headers = this.execution.response.toJSON().header
        headers.forEach( (header: { key: string, value: string }) => {
            headerResult += `"${header.key}": "${header.value}",`;
        })
        return JSON.parse(`{${headerResult.slice(0, -1)}}`)
    }

    getName(): string {
        return this.execution.item.name
    }

    getStatus(): 'PASS' | 'FAIL' {
        const assertions = this.execution.assertions
        assertions.forEach( asser => {
            if(asser.hasOwnProperty('error')) {
                return 'FAIL'
            }
        })
        return 'PASS'
    }

    getRequestData(): IRequest {
        const request = this.execution.request
        return {
            method: request.method,
            url: this.buildURL(),
            header: request.getHeaders(),
            body: this.buildRequestBody()
        }
    }

    getResponseData(): IResponse {
        const response = this.execution.response
        return {
            status: response.status || "unknoun",
            code: response.code || 0,
            header: this.buildResponseHeader(),
            body: this.buildResponseBody()
        }
    }

    getAssertionsData(): IAssertion[] {
        let result: IAssertion[] = []
        const assertions = this.execution.assertions
        assertions.forEach( assertion => {
            let status = "PASS"
            let err_msg = ""
            let schema = assertion.assertion === this.ValidationTestName ? this.getValidateSchemaName() : ""
            if(assertion.error != undefined) {
                status = "FAIL"
                err_msg = assertion.error.message
            }

           result.push({
            name: assertion.assertion,
            err_msg: err_msg,
            schema: schema,
            status: status
           })
        })
        return result
    }

    getValidateSchemaName():  string {
        let result: string = ""
        const events = this.execution.item.events.all()
        events.forEach(event => {
            const execs = event.script.exec
            execs?.forEach(exec => {
                Object.entries(this.jsonSchemas).forEach(([key, value]) => {
                    if (exec.includes(key)) {
                        result = key
                        return
                    }
                })
            })
        })
        return result
    }

    haveAssertion() {
        return this.execution.hasOwnProperty('assertions')
    }

    haveRequestError() {
        return this.execution.hasOwnProperty("requestError")
    }
}