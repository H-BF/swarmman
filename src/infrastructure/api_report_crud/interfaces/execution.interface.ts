export interface IExecutionReq {
    name: string
    launchUuid: string
    requestUuid: string
    responseUuid: string
}

export interface IExecutionRes {
    uuid: string    
}

export interface IExecutionUpdReq {
    uuid: string,
    name?: string
    launchUuid?: string
    requestUuid?: string
    responseUuid?: string
    failCount?: number
    passCount?: number
}

export interface IExecutionUpdRes {
    uuid: string,
    name: string
    launch_uuid: string
    request_uuid: string
    response_uuid: string
    fail_count: number
    pass_count: number
}