jest.mock("@services/messaging/bus");
import Message from "@services/messaging/message";
import MessageBus from "@services/messaging/bus";
const md5 = require("md5");

describe ('test Message', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2022-01-01 00:00:00'));

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test ('test dispatchScheduledAction', () => {
        const gpioId = 'TEST_GPIO';
        const expectedAction: any = {
            gpioId,
            action: 'on',
            caller: 'schedule',
            payload: { test: 'value' },
        };

        expectedAction.actionId = md5(JSON.stringify(expectedAction));
        expectedAction.calledAt = new Date();

        Message.dispatchScheduledAction(gpioId, 'on', { test: 'value' });

        expect(MessageBus.dispatchGpioAction).toHaveBeenCalledTimes(1);
        expect(MessageBus.dispatchGpioAction).toHaveBeenCalledWith(expectedAction);
    });

    test ('test dispatchSystemAction', () => {
        const gpioId = 'TEST_GPIO';
        const expectedAction: any = {
            gpioId,
            action: 'on',
            caller: 'system',
            payload: { test: 'value' },
        };

        expectedAction.actionId = md5(JSON.stringify(expectedAction));
        expectedAction.calledAt = new Date();

        Message.dispatchSystemAction(gpioId, 'on', { test: 'value' });

        expect(MessageBus.dispatchGpioAction).toHaveBeenCalledTimes(1);
        expect(MessageBus.dispatchGpioAction).toHaveBeenCalledWith(expectedAction);
    });

    test ('test dispatchUserAction', () => {
        const gpioId = 'TEST_GPIO';
        const expectedAction: any = {
            gpioId,
            action: 'on',
            caller: 'user',
            payload: { test: 'value' },
        };

        expectedAction.actionId = md5(JSON.stringify(expectedAction));
        expectedAction.calledAt = new Date();

        Message.dispatchUserAction(gpioId, 'on', { test: 'value' });

        expect(MessageBus.dispatchGpioAction).toHaveBeenCalledTimes(1);
        expect(MessageBus.dispatchGpioAction).toHaveBeenCalledWith(expectedAction);
    });
});
