import { messageService, Service } from "../util/api";
import { LOGGER } from "../instrumentation/log";

export const subscribePath = "/subscribe";

export const postSubscriptionRequestForTickUpdates = async () => {
    try {
        return messageService(Service.streamer, subscribePath);
    } catch (e) {
        LOGGER.error(e);
    }

    return null;
};
