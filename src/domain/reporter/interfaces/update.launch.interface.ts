import { LaunchStatus } from "../../../infrastructure/api_report_crud/interfaces/launch.interface"

export interface IUpdateLaunch {
    failCount?: number
    passCount?: number
    duration?: number
    status?: LaunchStatus
}