jest.mock('@services/ScriptCaller');
import ScriptCaller from "@services/ScriptCaller";
import GPIO from "@services/gpio";
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
});
