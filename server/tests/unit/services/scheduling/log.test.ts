import Log from "@services/scheduling/log";
import {IGPIOState} from "@services/gpio";

describe ('test schedule logger', () => {
    afterEach(() => {
        // @ts-ignore
        Log.stateLog = [];
    });

    test ('test pushState', () => {
        expect(Log.getLogs()).toHaveLength(0);

        const state: IGPIOState = {
            actionId: 'test-action-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        Log.pushState(state);

        expect(Log.getLogs()).toHaveLength(1);

        expect(Log.stateExists(state)).toBe(true);
        // @ts-ignore
        expect(Log.stateLog[0]).toBe(state);
    });

    test ('test getLogs ascending', () => {
        const state1: IGPIOState = {
            actionId: 'test-action-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state2: IGPIOState = {
            actionId: 'test-action2-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state3: IGPIOState = {
            actionId: 'test-action3-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        Log.pushState(state2);
        Log.pushState(state3);
        Log.pushState(state1);

        const logs = Log.getLogs(Log.LOG_ORDER_ASC);
        expect(logs[0]).toBe(state2);
        expect(logs[1]).toBe(state3);
        expect(logs[2]).toBe(state1);
    });

    test ('test getLogs descending', () => {
        const state1: IGPIOState = {
            actionId: 'test-action-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state2: IGPIOState = {
            actionId: 'test-action2-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state3: IGPIOState = {
            actionId: 'test-action3-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        Log.pushState(state2);
        Log.pushState(state1);
        Log.pushState(state3);

        const logs = Log.getLogs(Log.LOG_ORDER_DESC);
        expect(logs[0]).toBe(state3);
        expect(logs[1]).toBe(state1);
        expect(logs[2]).toBe(state2);
    });

    test ('test stateExists', () => {
        const state1: IGPIOState = {
            actionId: 'test-action-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state2: IGPIOState = {
            actionId: 'test-action2-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        const state3: IGPIOState = {
            actionId: 'test-action3-id',
            state: 'on',
            gpioId: 'TEST_GPIO',
            caller: 'schedule',
            timestamp: new Date(),
        };

        Log.pushState(state1);
        Log.pushState(state3);

        expect(Log.stateExists(state1)).toBe(true);
        expect(Log.stateExists(state3)).toBe(true);
        expect(Log.stateExists(state2)).toBe(false);
    });
});
