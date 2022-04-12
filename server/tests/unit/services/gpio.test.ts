jest.mock('@services/ScriptCaller');
import ScriptCaller from "@services/ScriptCaller";
import GPIO, {IGPIOState} from "@services/gpio";
import {when} from "jest-when";

describe ('test gpio service', () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test ('test call passes through to ScriptCaller.callGpioHL', async () => {
        const gpioId = 'TEST_GPIO';
        const setting = true;

        const callGpioHL = jest.fn();
        ScriptCaller.callGpioHL = callGpioHL;

        when(callGpioHL).calledWith(gpioId, setting).mockResolvedValue(true);

        await GPIO.call(gpioId, setting);

        expect(callGpioHL).toHaveBeenCalledTimes(1);
        expect(callGpioHL).toHaveBeenCalledWith(gpioId, setting);
    });

    test ('test getStatus passes through to ScriptCaller.callGpioStatus', async () => {
        const gpioId = 'TEST_GPIO';

        const callGpioStatus = jest.fn();
        ScriptCaller.callGpioStatus = callGpioStatus;

        when(callGpioStatus).calledWith(gpioId).mockResolvedValue(true);

        const status = await GPIO.getStatus(gpioId);

        expect(status).toBe(true);
        expect(callGpioStatus).toHaveBeenCalledTimes(1);
        expect(callGpioStatus).toHaveBeenCalledWith(gpioId);
    });

    test ('test getStatus returns false when ScriptCaller.callGpioStatus throws error', async () => {
        const gpioId = 'TEST_GPIO';

        const callGpioStatus = jest.fn();
        ScriptCaller.callGpioStatus = callGpioStatus;

        when(callGpioStatus).calledWith(gpioId).mockRejectedValue(new Error('Something went wrong'));

        const status = await GPIO.getStatus(gpioId);

        expect(status).toBe(false);
        expect(callGpioStatus).toHaveBeenCalledTimes(1);
        expect(callGpioStatus).toHaveBeenCalledWith(gpioId);
    });

    test ('test pushState', () => {
        const state: IGPIOState = {
            gpioId: 'TEST_GPIO',
            actionId: 'test-action-id',
            state: 'on',
            caller: 'system',
            timestamp: new Date(),
        };
        const anotherState: IGPIOState = { ...state, actionId: 'test-action-id2', caller: 'schedule' };

        GPIO.pushState(state);

        const hasFirstState = GPIO.hasState(state);
        const hasSecondState = GPIO.hasState(anotherState);

        expect(hasFirstState).toBe(true);
        expect(hasSecondState).toBe(false);
    });

    test ('test hasState', () => {
        const state1: IGPIOState = {
            gpioId: 'TEST_GPIO1',
            actionId: 'test-action-id',
            state: 'on',
            caller: 'system',
            timestamp: new Date(),
        };

        const state2: IGPIOState = { ...state1, gpioId: 'TEST_GPIO2', actionId: 'test-action-id2', caller: 'schedule' };
        const state3: IGPIOState = { ...state1, gpioId: 'TEST_GPIO1', actionId: 'test-action-id3', caller: 'user' };

        GPIO.pushState(state1);
        GPIO.pushState(state2);
        GPIO.pushState(state3);

        const hasState1ForGpio1 = GPIO.hasState(state1);
        const hasState1ForGpio2 = GPIO.hasState({ ...state1, gpioId: 'TEST_GPIO2' });
        const hasState2ForGpio1 = GPIO.hasState({ ...state2, gpioId: 'TEST_GPIO1' });
        const hasState2ForGpio2 = GPIO.hasState(state2);
        const hasState3ForGpio1 = GPIO.hasState(state3);
        const hasState3ForGpio2 = GPIO.hasState({ ...state3, gpioId: 'TEST_GPIO2' });

        expect(hasState1ForGpio1).toBe(true);
        expect(hasState1ForGpio2).toBe(false);
        expect(hasState2ForGpio1).toBe(false);
        expect(hasState2ForGpio2).toBe(true);
        expect(hasState3ForGpio1).toBe(true);
        expect(hasState3ForGpio2).toBe(false);
    });

    test ('test executeState', async () => {
        const gpioId = 'TEST_GPIO';
        const state1: IGPIOState = {
            gpioId,
            actionId: 'test-action-id',
            state: 'on',
            caller: 'user',
            timestamp: new Date(),
        };

        const state2: IGPIOState = { ...state1, state: 'off' };

        const callGpioHL = jest.fn();
        ScriptCaller.callGpioHL = callGpioHL;

        await GPIO.executeState(state1);
        await GPIO.executeState(state2);

        expect(callGpioHL).toHaveBeenCalledTimes(2);
        expect(callGpioHL).toHaveBeenCalledWith('TEST_GPIO', true);
        expect(callGpioHL).toHaveBeenCalledWith('TEST_GPIO', false);
    });

    test ('test stateWasOverridden', () => {
        const gpioId = 'TEST_GPIO';
        const state1: IGPIOState = {
            gpioId,
            actionId: 'test-action-id',
            state: 'on',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state2: IGPIOState = {
            gpioId,
            actionId: 'test-action-id2',
            state: 'on',
            caller: 'system',
            timestamp: new Date(),
        };

        const state3: IGPIOState = {
            gpioId,
            actionId: 'test-action-id3',
            state: 'off',
            caller: 'user',
            timestamp: new Date(),
        };

        GPIO.pushState(state1);

        expect(GPIO.stateWasOverridden(state1)).toBe(false);

        GPIO.pushState(state2);

        expect(GPIO.stateWasOverridden(state1)).toBe(false);
        expect(GPIO.stateWasOverridden(state2)).toBe(false);

        // Once a user initiated action is pushed, old states are overridden
        GPIO.pushState(state3);

        expect(GPIO.stateWasOverridden(state1)).toBe(true);
        expect(GPIO.stateWasOverridden(state2)).toBe(true);
    });
});
