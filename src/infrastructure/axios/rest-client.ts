import { Axios } from "axios";
import { IRestClientInit } from "./interfaces/rest-client.init.interface";
import { logger } from "../tslog/tslog";

export class RestClient extends Axios {

    constructor({ baseUrl, port, protocol }: IRestClientInit) {
        super({
            baseURL: `${protocol}://${baseUrl}:${port}`,
            headers: {
                "Content-type": "application/json"
            },
            transformResponse: [function (data) {
                try {
                    if (data)
                        return JSON.parse(data)
                } catch (e) {
                    logger.warn("Payload type is unexpected", e)
                }

                return data
            }],
            transformRequest: [
                function (data) {
                    if (data && "object" == typeof data)
                        return JSON.stringify(data)
                    return data
                }
            ],
            validateStatus: (status) => {
                if(!(status >= 200 && status < 300)) {
                    return false
                }
                return true
            }
        })
    }
}