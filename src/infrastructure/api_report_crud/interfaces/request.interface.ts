export interface IRequestReq {
    method: Method
    url: string
    header: string
    body: string
}

export interface IRequestRes {
    uuid: string
}

export enum Method {
    GET = 'GET',
    POST = 'POST'
}