jest.mock("fs");
import Config, {IConfig} from "@services/config";
const fs = require("fs");

describe ('test Config', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    test ('test basic getters', () => {
        const configData: IConfig = {
            gpio: [
                {
                    id: 'GPIO_TEST',
                    pin: 12,
                    normal: 'off',
                    name: 'Gpio Test',
                }
            ],
            paths: {
                scripts: {
                    python: '/path/to/python/scripts',
                },
                application: '/path/to/app',
            },
            schedules: [],
        };

        const config = new Config(configData);

        expect(config.getConfig()).toBe(configData);
        expect(config.getSchedules()).toBe(configData.schedules);
    });

    test ('test getGpioById', () => {
        const configData: IConfig = {
            gpio: [
                {
                    id: 'GPIO_TEST',
                    pin: 12,
                    normal: 'off',
                    name: 'Gpio Test',
                },
                {
                    id: 'GPIO_TEST2',
                    pin: 13,
                    normal: 'on',
                    name: 'Gpio Test 2',
                }
            ],
            paths: {
                scripts: {
                    python: '/path/to/python/scripts',
                },
                application: '/path/to/app',
            },
            schedules: [],
        };

        const config = new Config(configData);

        const gpioPin12 = config.getGpioById('GPIO_TEST');
        const gpioPin13 = config.getGpioById('GPIO_TEST2');
        const gpioNotFound = config.getGpioById('INVALID_PIN');

        expect(gpioPin12).toEqual({
            id: 'GPIO_TEST',
            pin: 12,
            normal: 'off',
            name: 'Gpio Test',
        });

        expect(gpioPin13).toEqual({
            id: 'GPIO_TEST2',
            pin: 13,
            normal: 'on',
            name: 'Gpio Test 2',
        });

        expect(gpioNotFound).toBeNull();
    });

    test ('test getSchedule', () => {
        const configData: IConfig = {
            gpio: [],
            paths: {
                scripts: {
                    python: '/path/to/python/scripts',
                },
                application: '/path/to/app',
            },
            schedules: [
                {
                    id: 'monday',
                    day: 'Monday',
                    enabled: true,
                    start: '10:00:00',
                    end: '10:30:00',
                    states: [
                        {
                            id: 'GPIO_TEST',
                            state: 'on',
                        }
                    ],
                },
                {
                    id: 'tuesday',
                    day: 'Tuesday',
                    enabled: false,
                    start: '10:12:00',
                    end: '10:45:00',
                    states: [
                        {
                            id: 'GPIO_TEST',
                            state: 'off',
                        }
                    ],
                },
            ],
        };

        const config = new Config(configData);

        const monday = config.getScheduleById('monday');
        const tuesday = config.getScheduleById('tuesday');
        const nonExistent = config.getScheduleById('someday');

        expect(monday).toEqual({
            id: 'monday',
            day: 'Monday',
            enabled: true,
            start: '10:00:00',
            end: '10:30:00',
            states: [
                {
                    id: 'GPIO_TEST',
                    state: 'on',
                }
            ],
        });

        expect(tuesday).toEqual({
            id: 'tuesday',
            day: 'Tuesday',
            enabled: false,
            start: '10:12:00',
            end: '10:45:00',
            states: [
                {
                    id: 'GPIO_TEST',
                    state: 'off',
                }
            ],
        });

        expect(nonExistent).toBeNull();
    });

    test ('test updateSchedules', async () => {
        const writeFileSync = jest.fn();
        fs.writeFileSync = writeFileSync;

        const configData: IConfig = {
            gpio: [
                {
                    id: 'GPIO_TEST',
                    pin: 12,
                    normal: 'off',
                    name: 'Gpio Test',
                }
            ],
            paths: {
                scripts: {
                    python: '/path/to/python/scripts',
                },
                application: '/path/to/app',
            },
            schedules: [
                {
                    id: 'monday',
                    day: 'Monday',
                    enabled: true,
                    start: '10:00:00',
                    end: '10:45:00',
                    states: [],
                },
            ],
        };
        const config = new Config(configData);

        const updatedSchedules: any = [
            {
                id: 'monday',
                day: 'Monday',
                enabled: true,
                start: '10:00:00',
                end: '10:45:00',
                states: [
                    {
                        id: 'GPIO_TEST',
                        state: 'off',
                    }
                ],
            },
            {
                id: 'tuesday',
                day: 'Tuesday',
                enabled: false,
                start: '10:31:00',
                end: '10:55:00',
                states: [],
            },
        ];

        const expectedJsonConfig = JSON.stringify({
            gpio: [
                {
                    id: 'GPIO_TEST',
                    pin: 12,
                    normal: 'off',
                    name: 'Gpio Test',
                }
            ],
            paths: {
                scripts: {
                    python: '/path/to/python/scripts',
                },
                application: '/path/to/app',
            },
            schedules: [
                {
                    id: 'monday',
                    day: 'Monday',
                    enabled: true,
                    start: '10:00:00',
                    end: '10:45:00',
                    states: [
                        {
                            id: 'GPIO_TEST',
                            state: 'off',
                        }
                    ],
                },
                {
                    id: 'tuesday',
                    day: 'Tuesday',
                    enabled: false,
                    start: '10:31:00',
                    end: '10:55:00',
                    states: [],
                },
            ],
        });

        process.env.DATA_DIR = '/path/to/data';
        await config.updateSchedules(updatedSchedules);

        expect(writeFileSync).toHaveBeenCalledTimes(1);
        expect(writeFileSync).toHaveBeenCalledWith('/path/to/data/base_configuration.json', expectedJsonConfig);
        expect(config.getConfig()).toEqual(JSON.parse(expectedJsonConfig));
    });
});
