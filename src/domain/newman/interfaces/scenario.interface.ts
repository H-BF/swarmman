import { CollectionDefinition } from 'postman-collection';

export interface IScenario {
    scenario: CollectionDefinition,
    service: string,
    jsonSchemas: Record<string, string>
}