import { TestDataPreparation } from "./domain/newman/test-data-preparation";
import { Runner } from "./domain/runner/runner";
import { logger } from "./infrastructure/tslog/tslog";

(async () => {
    (new TestDataPreparation())
        .getScenarios()
        .forEach(async scenario => {
            (new Runner(scenario)).run()
        })
})().catch(err => {
    if (err instanceof Error) {
        logger.error(err.message)
    }
    process.exit(1)
});