import { CollectionDefinition, VariableDefinition } from 'postman-collection';
import { IScenario } from './interfaces/scenario.interface';
import { logger } from '../../infrastructure/tslog/tslog';
import path from 'path';
import fs from 'fs';

export class TestDataPreparation {

    private scenarios: IScenario[] = []
    private services: Record<string, string[]> = {}

    constructor() {
        const dir = path.resolve(__dirname, '../../data')

        const files: string[] = fs.readdirSync(dir)
        const testDataFiles: string[] = files.filter((file) => 
            path.extname(file) === '.json' && file.includes('.test-data.json')
        );

        testDataFiles.forEach(file => {

            const scenario = this.getScenario(fs.readFileSync(`${dir}/${file}`, 'utf-8'))

            if (!scenario) {
                logger.error(`Файл ${file} не является корректным файлом JSON`)
                return
            }

            const host = this.getHost(scenario)
            const port = this.getPort(scenario)
            const jsonSchemas = this.getJsonSchemas(scenario)
            const service = this.getServiceName(scenario)

            if(!host) {
                logger.error(`Файл ${file} не содержит обязательного параметра HOST`)
                return
            }

            if(!port) {
                logger.error(`Файл ${file} не содержит обязательного параметра PORT`)
                return
            }

            if(!service) {
                logger.error(`Файл ${file} не содержит обязательного параметра serviceName`)
                return 
            }

            this.addToServices(service, file)
        
            this.scenarios.push({
                scenario: scenario,
                service: service,
                jsonSchemas: jsonSchemas
            })
        })

        if(this.haveDublicate()) 
            throw new Error("Файлы имеют не уникальные сервисы")
    }

    getScenarios(): IScenario[] {
        return this.scenarios
    }

    private getScenario(file: string): CollectionDefinition | undefined {
        try {
            const data: CollectionDefinition = JSON.parse(file)
            return data
        } catch(err) {
            return undefined
        }
    }

    private getServiceName(scenario: CollectionDefinition): string | null {
        return this.getVaribleValue(scenario, "serviceName")
    }

    private getHost(scenario: CollectionDefinition): string | null {
        return this.getVaribleValue(scenario, "HOST")
    }

    private getPort(scenario: CollectionDefinition): string | null {
        return this.getVaribleValue(scenario, "PORT")
    }

    private getJsonSchemas(scenario: CollectionDefinition): Record<string, string> {
        let jsonSchemas: Record<string, string> = {}

        if(!scenario.variable) return jsonSchemas;
            
        scenario.variable.forEach((vr: VariableDefinition) => {
            if(vr.key && vr.key.includes('JsonSchema')) {
                jsonSchemas[vr.key] = vr.value
            }
        })

        return jsonSchemas
    }

    private addToServices(serviceName: string, fileName: string) {
        if (serviceName in this.services) {
            this.services[serviceName].push(fileName)
        } else {
            this.services[serviceName] = [fileName]
        }
    }

    private haveDublicate(): boolean {
        let haveError = false
        Object.entries(this.services).forEach(([key, value]) => {
            if (value.length != 1) {
                haveError = true
                logger.error(`Два файла содержат сервис '${key}': ${value.join(', ')}`)
            }
        })
        return haveError
    }

    private getVaribleValue (
        scenario: CollectionDefinition,
        variableName: string
    ): string | null {
        let variableValue: string | null = null

        if(!scenario.variable) return variableValue

        const variable = scenario.variable.find((vr: VariableDefinition) => {
            return vr.key === variableName
        })

        if(variable && variable.value) {
            variableValue = variable.value
        }

        return variableValue
    }
}