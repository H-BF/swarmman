import { LaunchStatus } from "../../infrastructure/api_report_crud/interfaces/launch.interface";
import { NewmanDataExtractor } from "../newman/newman-data-extractor";
import { IScenario } from "../newman/interfaces/scenario.interface";
import { NewmanRunner } from "../newman/newman-runner";
import { Reporter } from "../reporter/reporter";
import fs from 'fs';
import { ILogObj, Logger } from "tslog";
import { logger } from "../../infrastructure/tslog/tslog";

export class Runner {

    private scenario: IScenario
    private reporter: Reporter
    private subLogger: Logger<ILogObj>

    constructor(scenario: IScenario) {
        this.scenario = scenario
        this.subLogger = logger.getSubLogger({ name: scenario.service })
        this.reporter = new Reporter(this.subLogger)
    }

    async run() {
        try {
            await this.reporter.createLaunch(this.scenario.service)
            await this.reporter.updateLaunch({
                status: LaunchStatus.IN_PORCESS
            })
            await this.reporter.writeValidateJsonSchemas(this.scenario.jsonSchemas)
    
            const summury = await NewmanRunner(this.scenario.scenario)
            fs.writeFileSync("res2.json", JSON.stringify(summury))
            const nde = new NewmanDataExtractor(summury, this.scenario.jsonSchemas, this.subLogger)
            
            const { total, failed } = nde.getAssertionNumber()
            
            await this.reporter.writeExecutionsData(nde.transformExecutionsData())
            await this.reporter.updateLaunch({
                failCount: failed,
                passCount: total - failed,
                duration: nde.getDuration(),
                status: LaunchStatus.FINISH
            })
        } catch(err) {
            console.log(err)
            await this.reporter.createError(`${err}`)
            await this.reporter.updateLaunch({status: LaunchStatus.ERROR})
        }
    }
}