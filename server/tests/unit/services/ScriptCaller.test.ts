jest.mock("child_process");
import {when} from "jest-when";
import each from "jest-each";
import Config from "@services/config";
import ScriptCaller from "@services/ScriptCaller";
const { exec } = require("child_process");

describe ('test ScriptCaller service', () => {
    beforeEach(() => {
        process.env.SCRIPTS_DIR = '/path/to/scripts';
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    each([
        // Tests that a "normally off" device will receive a HIGH setting when trying to turn on
        [
            true, // Setting to set the pin to (true=ON, false=OFF)
            'off', // "normal" setting of the relay
            'HIGH', // Expected GPIO setting
            1, // Expected setting to be passed to the script (1=ON, 0=OFF)
        ],
        // Tests that a "normally on" device will receive a LOW setting when trying to turn on
        [
            true,
            'on',
            'LOW',
            0,
        ],
        // Tests that a "normally off" device will receive a LOW setting when trying to turn off
        [
            false,
            'off',
            'LOW',
            0,
        ],
        // Tests that a "normally on" device will receive a HIGH setting when trying to turn off
        [
            false,
            'on',
            'HIGH',
            1,
        ]
    ]).test ('test callGpioHL calls correct setting based on gpio normal config', async (
        setting: boolean,
        normal: string,
        expectedGpioSetting: string,
        expectedScriptSetting: number
    ) => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';

        const gpioConfigMock: any = {
            pin: 12,
            id: 'TEST_DEVICE',
            name: 'Test Device',
            normal,
        };

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(gpioConfigMock);

        exec.mockImplementation((command: string, callback: any) => callback(null, 'Pin 12 set to ' + expectedGpioSetting));

        await ScriptCaller.callGpioHL(gpioId, setting);
        await Promise.resolve();

        expect(configMock.getGpioById).toHaveBeenCalledTimes(1);
        expect(configMock.getGpioById).toHaveBeenCalledWith(gpioId);
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith('python3 /path/to/scripts/gpio_hl.py 12 ' + expectedScriptSetting, expect.any(Function));
    });

    test ('test callGpioHL rejects when exec stdout is not valid', async () => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';
        const setting = true;

        const gpioConfigMock: any = {
            pin: 12,
            id: 'TEST_DEVICE',
            name: 'Test Device',
            normal: 'off',
        };

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(gpioConfigMock);

        exec.mockImplementation((command: string, callback: any) => callback(null, 'Some error message from the script'));

        await expect(ScriptCaller.callGpioHL(gpioId, setting)).rejects.toThrow(new Error('Some error message from the script'));
        await Promise.resolve();

        expect(configMock.getGpioById).toHaveBeenCalledTimes(1);
        expect(configMock.getGpioById).toHaveBeenCalledWith(gpioId);
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith('python3 /path/to/scripts/gpio_hl.py 12 1', expect.any(Function));
    });

    test ('test callGpioHL rejects when exec returns an error', async () => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';
        const setting = true;

        const gpioConfigMock: any = {
            pin: 12,
            id: 'TEST_DEVICE',
            name: 'Test Device',
            normal: 'off',
        };

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(gpioConfigMock);

        exec.mockImplementation((command: string, callback: any) => callback(new Error('Something went wrong!'), 'stdout'));

        await expect(ScriptCaller.callGpioHL(gpioId, setting)).rejects.toThrow(new Error('Something went wrong!'));
        await Promise.resolve();

        expect(configMock.getGpioById).toHaveBeenCalledTimes(1);
        expect(configMock.getGpioById).toHaveBeenCalledWith(gpioId);
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith('python3 /path/to/scripts/gpio_hl.py 12 1', expect.any(Function));
    });

    test ('test callGpioHL throws error when gpio config not valid', async () => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';
        const setting = true;

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(null);

        await expect(ScriptCaller.callGpioHL(gpioId, setting)).rejects.toThrow(new Error('TEST_DEVICE is not a valid GPIO configuration'));
        await Promise.resolve();

        expect(configMock.getGpioById).toHaveBeenCalledTimes(1);
        expect(configMock.getGpioById).toHaveBeenCalledWith(gpioId);
        expect(exec).not.toHaveBeenCalled();
    });

    each([
        [
            'off', // The "normal" setting for the relay
            1, // The mocked current pin status
            true, // The expected returned status
        ],
        [
            'off',
            0,
            false,
        ],
        [
            'on',
            1,
            false,
        ],
        [
            'on',
            0,
            true,
        ],
    ]).test ('test callGpioStatus returns correct setting based on gpio normal config', async (normal: string, gpioPinStatus: number, expectedStatus: boolean) => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';

        const gpioConfigMock: any = {
            pin: 12,
            id: 'TEST_DEVICE',
            name: 'Test Device',
            normal,
        };

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(gpioConfigMock);

        exec.mockImplementation((command: string, callback: any) => callback(null, gpioPinStatus));

        const status = await ScriptCaller.callGpioStatus(gpioId);
        expect(status).toBe(expectedStatus);

        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith('python3 /path/to/scripts/gpio_status.py 12', expect.any(Function));
    });

    test ('test callGpioStatus throws error when exec fails', async () => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';

        const gpioConfigMock: any = {
            pin: 12,
            id: 'TEST_DEVICE',
            name: 'Test Device',
            normal: 'off',
        };

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(gpioConfigMock);

        const error = new Error('Something went wrong!');
        exec.mockImplementation((command: string, callback: any) => callback(error, 1));

        await expect(ScriptCaller.callGpioStatus(gpioId)).rejects.toThrow(error);

        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith('python3 /path/to/scripts/gpio_status.py 12', expect.any(Function));
    });

    test ('test callGpioStatus throws error when gpio config not valid', async () => {
        const configMock: any = {
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const gpioId = 'TEST_DEVICE';

        when(configMock.getGpioById).calledWith(gpioId).mockReturnValue(null);
        await expect(ScriptCaller.callGpioStatus(gpioId)).rejects.toThrow(new Error('TEST_DEVICE is not a valid GPIO configuration'));

        expect(exec).not.toHaveBeenCalled();
    });
});
