import { historicallyAggregateIndicatorsPerMinute } from "../resources/relativeAggregate";

(async () => {
    const aggregates = await historicallyAggregateIndicatorsPerMinute();
})();
