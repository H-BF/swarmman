import { NewmanRunSummary } from "newman";
import { ExecutionDataExecutor } from "./execution-data-extractor";
import { IExecution } from "./interfaces/execution.interface";
import { ILogObj, Logger } from "tslog";

export class NewmanDataExtractor {

    private report: NewmanRunSummary
    private jsonSchemas: Record<string, string>
    private logger: Logger<ILogObj>

    constructor(
        report: NewmanRunSummary,
        jsonSchemas: Record<string, string>,
        logger: Logger<ILogObj>
    ) {
        this.report = report
        this.jsonSchemas = jsonSchemas
        this.logger = logger
    }   

    getDuration(): number {
        let start = this.report.run.timings.started
        let finish = this.report.run.timings.completed
        if (!start || !finish) {
            throw new Error("Нельзя вычислить длительность. Отсутствуют данные")
        }
        return finish - start
    }

    getAssertionNumber(): { total: number, failed: number } {
        const asser = this.report.run.stats.assertions
        return { total: asser.total || 0, failed: asser.failed || 0 }
    }

    transformExecutionsData(): IExecution[] {
        let result: IExecution[] = []
        this.report.run.executions.forEach( execution => {
            const exec = new ExecutionDataExecutor(execution, this.jsonSchemas)
            const name = exec.getName()
            const execLogger = this.logger.getSubLogger({ name: name }) 

            if (exec.haveRequestError()) {
                execLogger.error(`Ошибка при запросе`)
                return
            }

            if(!exec.haveAssertion()) {
                execLogger.warn(`Нет тестов`)
                return
            }

            result.push({
                name: name,
                status: exec.getStatus(),
                request: exec.getRequestData(),
                response: exec.getResponseData(),
                assertions: exec.getAssertionsData()
            })
        })
        return result
    }
}