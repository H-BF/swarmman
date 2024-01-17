import { IExecution } from "./execution.interface"

export interface ILaunch {
    failed: number
    passed: number
    duration: number
    executions: IExecution[]
}