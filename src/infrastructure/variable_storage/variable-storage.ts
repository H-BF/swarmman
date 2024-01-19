import { logger } from '../tslog/tslog';
import { VarStorage, requiredVariables } from './required-variables.joi'

class VariablesStorage {
 
    private variables: VarStorage
    
    constructor() {
        const envVars: any = {
            REPORTER_HOST: process.env.REPORTER_HOST, 
            REPORTER_PORT: process.env.REPORTER_PORT,
            REPORTER_PROTOCOL: process.env.REPORTER_PROTOCOL,
            PIPLINE_ID: process.env.PIPLINE_ID,
            JOB_ID:  process.env.JOB_ID,
            SRC_BRANCH: process.env.SRC_BRANCH,        
            COMMIT: process.env.COMMIT,
            TAG: process.env.TAG,
        }

        const { value, error } = requiredVariables.validate<VarStorage>(envVars, {
            abortEarly: false,
        })

        if (error) {
            throw new Error(`Ошибка валидации переменных окружения: ${error.details.map(d => d.message).join(', ')}`);
        }

        this.variables = value
    }

    getVariables(): VarStorage {
        return this.variables
    }
}

function initVariableStorage(): VariablesStorage {
    try {
        return new VariablesStorage()
    } catch(err) {
        logger.error(err)
        process.exit(1)
    }
}

export const variables = initVariableStorage().getVariables()