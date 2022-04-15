jest.mock("@services/gpio");
import GPIO, {IGPIOAction, IGPIOState} from "@services/gpio";
import MessageBus from "@services/messaging/bus";
import {when} from "jest-when";

describe ('test MessageBus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test ('test dispatchGpioAction executes when caller is `user`', async () => {
        const gpioId = 'TEST_GPIO';
        const action: IGPIOAction = {
            actionId: 'test-action-id',
            gpioId,
            action: 'on',
            caller: 'user',
            calledAt: new Date(),
        };

        const expectedState: IGPIOState = {
            gpioId,
            actionId: action.actionId,
            state: action.action,
            timestamp: action.calledAt,
            caller: action.caller,
        };

        // @ts-ignore
        when(GPIO.executeState).calledWith(expectedState).mockResolvedValue({});

        MessageBus.dispatchGpioAction(action);
        await Promise.resolve();

        expect(GPIO.executeState).toHaveBeenCalledTimes(1);
        expect(GPIO.executeState).toHaveBeenCalledWith(expectedState);
        expect(GPIO.pushState).toHaveBeenCalledTimes(1);
        expect(GPIO.pushState).toHaveBeenCalledWith(expectedState);
    });

    test ('test dispatchGpioAction executes when caller is `schedule` and hasState is false', async () => {
        const gpioId = 'TEST_GPIO';
        const action: IGPIOAction = {
            actionId: 'test-action-id',
            gpioId,
            action: 'on',
            caller: 'schedule',
            calledAt: new Date(),
        };

        const expectedState: IGPIOState = {
            gpioId,
            actionId: action.actionId,
            state: action.action,
            timestamp: action.calledAt,
            caller: action.caller,
        };

        when(GPIO.hasState).calledWith(expectedState).mockReturnValue(false);

        // @ts-ignore
        when(GPIO.executeState).calledWith(expectedState).mockResolvedValue({});

        MessageBus.dispatchGpioAction(action);
        await Promise.resolve();

        expect(GPIO.executeState).toHaveBeenCalledTimes(1);
        expect(GPIO.executeState).toHaveBeenCalledWith(expectedState);
        expect(GPIO.pushState).toHaveBeenCalledTimes(1);
        expect(GPIO.pushState).toHaveBeenCalledWith(expectedState);
    });

    test ('test dispatchGpioAction executes when caller is `schedule` and hasState is true and stateWasOverridden is false', async () => {
        const gpioId = 'TEST_GPIO';
        const action: IGPIOAction = {
            actionId: 'test-action-id',
            gpioId,
            action: 'on',
            caller: 'schedule',
            calledAt: new Date(),
        };

        const expectedState: IGPIOState = {
            gpioId,
            actionId: action.actionId,
            state: action.action,
            timestamp: action.calledAt,
            caller: action.caller,
        };

        when(GPIO.hasState).calledWith(expectedState).mockReturnValue(true);
        when(GPIO.stateWasOverridden).calledWith(expectedState).mockReturnValue(false);

        // @ts-ignore
        when(GPIO.executeState).calledWith(expectedState).mockResolvedValue({});

        MessageBus.dispatchGpioAction(action);
        await Promise.resolve();

        expect(GPIO.executeState).toHaveBeenCalledTimes(1);
        expect(GPIO.executeState).toHaveBeenCalledWith(expectedState);
        expect(GPIO.pushState).toHaveBeenCalledTimes(1);
        expect(GPIO.pushState).toHaveBeenCalledWith(expectedState);
    });

    test ('test dispatchGpioAction does not execute when caller is `schedule` and hasState is true and stateWasOverridden is true', async () => {
        const gpioId = 'TEST_GPIO';
        const action: IGPIOAction = {
            actionId: 'test-action-id',
            gpioId,
            action: 'on',
            caller: 'schedule',
            calledAt: new Date(),
        };

        const expectedState: IGPIOState = {
            gpioId,
            actionId: action.actionId,
            state: action.action,
            timestamp: action.calledAt,
            caller: action.caller,
        };

        when(GPIO.hasState).calledWith(expectedState).mockReturnValue(true);
        when(GPIO.stateWasOverridden).calledWith(expectedState).mockReturnValue(true);

        MessageBus.dispatchGpioAction(action);
        await Promise.resolve();

        expect(GPIO.executeState).not.toHaveBeenCalled();
        expect(GPIO.pushState).not.toHaveBeenCalled();
    });
});