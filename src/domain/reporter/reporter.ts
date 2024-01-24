import { ApiReporterClient } from "../../infrastructure/api_report_crud/api-report-client";
import { IAssertionReq, TestStatus } from "../../infrastructure/api_report_crud/interfaces/assertion.interface";
import { ICreateLaunchErrorReq } from "../../infrastructure/api_report_crud/interfaces/create-launch-err.interface";
import { ICreateLaunchReq, IUpdateLaunchReq } from "../../infrastructure/api_report_crud/interfaces/launch.interface";
import { Method } from "../../infrastructure/api_report_crud/interfaces/request.interface";
import { logger } from "../../infrastructure/tslog/tslog";
import { variables } from "../../infrastructure/variable_storage/variable-storage";
import { IExecution } from "../newman/interfaces/execution.interface";
import { IUpdateLaunch } from "./interfaces/update.launch.interface";
import { ILogObj, Logger } from "tslog";

export class Reporter {

    private jsonSchemas: Record<string, string> = {}
    private launchUUID: string | undefined
    private client: ApiReporterClient
    private logger: Logger<ILogObj>
    
    constructor(logger: Logger<ILogObj>) {
        this.client = new ApiReporterClient()
        this.logger = logger
    }

    async createLaunch(serviceName: string): Promise<void> {
        const launch: ICreateLaunchReq = {
            pipeline: variables.PIPLINE_ID,
            job: variables.JOB_ID,
            srcBranch: variables.SRC_BRANCH,
            commit: variables.COMMIT,
            tag: variables.TAG,
            serviceName: serviceName
        }

        this.logger.info('Создаем launch')
        this.launchUUID = await this.client.createLaunch(launch)
        this.logger.info(`launch создан: ${this.launchUUID}`)
    }

    async updateLaunch(
        {failCount, passCount, duration, status}: IUpdateLaunch
    ): Promise<void> {
        if (!this.launchUUID)
            throw new Error("Missing launch uuid! Start thr launch.")

        const launch: IUpdateLaunchReq = {
            uuid: this.launchUUID,
            failCount: failCount,
            passCount: passCount,
            duration: duration,
            status: status
        }

        this.logger.info(`Обновляем launch ${this.launchUUID}`)
        await this.client.updateLaunch(launch)
    }

    async createError(message: string): Promise<void> {
        if (!this.launchUUID)
            throw new Error("Missing launch uuid! Start thr launch.")

        const error: ICreateLaunchErrorReq = {
            launch_uuid: this.launchUUID,
            message: message
        }

        this.logger.info(`Создаем ошибку для launch ${this.launchUUID}`)
        await this.client.createLaunchError(error)
    }

    async writeValidateJsonSchemas(data: Record<string, string>) {

        if (!this.launchUUID)
            throw new Error('Missing launch uuid! Start thr launch.')

        Object.entries(data).forEach(async ([key, value]) => {
            this.logger.info(`Сохраняем jsonSchema: ${key}`)
            const uuid = await this.client.createJsonSchema({
                name: key,
                launchUuid: this.launchUUID!,
                schema: value
            })
            this.jsonSchemas[key] = uuid
        })
    }

    async writeExecutionsData(executions: IExecution[]) {
        if (!this.launchUUID)
            throw new Error('Missing launch uuid! Start thr launch.')

        for (const execution of executions) {

            let assertionData: IAssertionReq[] = []
            let failCount: number = 0
            let passCount: number = 0

            const requestUuid = await this.client.createRequest({
                method: execution.request.method as Method,
                url: execution.request.url,
                header: JSON.stringify(execution.request.header),
                body: JSON.stringify(execution.request.body)
            })

            const responseUuid = await this.client.createResponse({
                status: execution.response.status,
                code: execution.response.code,
                header: JSON.stringify(execution.response.header),
                body: JSON.stringify(execution.response.body)
            })

            const executionUuid = await this.client.createExecution({
                name: execution.name,
                launchUuid: this.launchUUID,
                requestUuid: requestUuid,
                responseUuid: responseUuid
            })

            for (const assertion of execution.assertions) {
                const status = assertion.status.toLowerCase() as TestStatus
                assertionData = assertionData.concat({
                    name: assertion.name,
                    executionUuid: executionUuid,
                    errorMessage: assertion.err_msg || null,
                    jsonSchema: this.jsonSchemas[assertion.schema] || null,
                    status: status
                })

                switch (status) {
                    case 'pass':
                        passCount++;
                        break;
                    case 'fail':
                        failCount++;
                        break
                }
            }

            await this.client.updateExecution({
                uuid: executionUuid,
                failCount: failCount,
                passCount: passCount
            })

            await this.client.createAssertions(assertionData)
        }
    }
}