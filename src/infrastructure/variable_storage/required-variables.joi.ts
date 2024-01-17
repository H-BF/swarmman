import * as joi from '@hapi/joi';
import 'joi-extract-type'

export const requiredVariables = joi.object({
    REPORTER_HOST: joi.string()
        .hostname()
        .required(),

    REPORTER_PORT: joi.number()
        .integer()
        .min(0)
        .max(65535)
        .required(),

    REPORTER_PROTOCOL: joi.string()
        .valid('http', 'https')
        .required(),
    
    PIPLINE_ID: joi.number().required(),

    JOB_ID:  joi.number().required(),

    SRC_BRANCH: joi.string().required(),

    DST_BRANCH: joi.string().required(),

    COMMIT: joi.string().required(),

    TAG: joi.string().required(),
  });

  export type VarStorage = joi.extractType<typeof requiredVariables>;
 