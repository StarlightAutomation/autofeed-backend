import Message from "../../../../src/services/messaging/message";

jest.useFakeTimers();
jest.mock("@services/gpio");
jest.mock("@services/messaging/message");
jest.mock("@services/scheduling/log");
jest.mock("@services/mqtt/client");
import Scheduler from "@services/scheduling/scheduler";
import Config, {IGPIOConfig} from "@services/config";
import GPIO from "@services/gpio";
import {ISchedule} from "@services/scheduler";
import {when} from "jest-when";
import Log from "../../../../src/services/scheduling/log";
import moment from "moment";

describe ('test scheduler', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
        jest.clearAllTimers();

        // @ts-ignore
        Scheduler.instance = undefined;
    });

    test ('test initialize creates new scheduler instance', () => {
        const scheduler = Scheduler.initialize();
        // @ts-ignore
        expect(Scheduler.instance).toBe(scheduler);

        const reinitialized = Scheduler.initialize();
        expect(reinitialized).toBe(scheduler);
    });

    test ('test start throws error if scheduler not initialized', () => {
        const call = () => Scheduler.start();
        expect(call).toThrow(new Error('Scheduler not initialized'));
    });

    test ('test start boots intervals', () => {
        const configMock: any = {
            getConfig: () => {
                return {
                    mqtt: {},
                };
            },
            getScheduleById: () => {
                return null;
            },
        };
        Config.instance = configMock;

        // @ts-ignore
        global.setInterval = jest.fn();

        Scheduler.initialize();
        Scheduler.start();

        expect(global.setInterval).toHaveBeenCalledTimes(2);
        expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
        expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    test ('test start boots intervals with custom timers', () => {
        const configMock: any = {
            getConfig: () => {
                return {
                    mqtt: {
                        refreshInterval: 5678,
                    },
                    scheduleInterval: 1234,
                };
            },
            getScheduleById: () => {
                return null;
            },
        };
        Config.instance = configMock;

        // @ts-ignore
        global.setInterval = jest.fn();

        Scheduler.initialize();
        Scheduler.start();

        expect(global.setInterval).toHaveBeenCalledTimes(2);
        expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 1234);
        expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 5678);
    });

    test ('test start boots intervals skips booting mqtt interval when mqtt not configured', () => {
        const configMock: any = {
            getConfig: () => {
                return {};
            },
            getScheduleById: () => {
                return null;
            },
        };
        Config.instance = configMock;

        // @ts-ignore
        global.setInterval = jest.fn();

        Scheduler.initialize();
        Scheduler.start();

        expect(global.setInterval).toHaveBeenCalledTimes(1);
        expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    test ('test start runs schedule and reverts states - returns early when desired state present', () => {
        // @ts-ignore
        Date.now = jest.fn(() => new Date('2022-01-01 10:00:00'));

        const configMock: any = {
            getConfig: jest.fn(),
            getScheduleById: jest.fn(),
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const returnedSchedule: ISchedule = {
            start: '10:30:00',
            end: '11:00:00',
            id: 'saturday',
            day: 'Saturday',
            enabled: true,
            states: [
                {
                    id: 'TEST_GPIO',
                    state: 'on',
                }
            ],
        };

        const testGpioConfig: IGPIOConfig = {
            id: 'TEST_GPIO',
            pin: 12,
            name: 'Test GPIO',
            normal: 'off',
        };

        when(configMock.getConfig).calledWith().mockReturnValue({});
        when(configMock.getScheduleById).calledWith('saturday').mockReturnValue(returnedSchedule);
        when(configMock.getGpioById).calledWith('TEST_GPIO').mockReturnValue(testGpioConfig);
        // @ts-ignore
        when(GPIO.getStatus).calledWith('TEST_GPIO').mockResolvedValue(false);

        Scheduler.initialize();
        Scheduler.start();
    });

    test ('test start runs schedule and reverts states - does nothing when state was already reverted', () => {
        // @ts-ignore
        Date.now = jest.fn(() => new Date('2022-01-01 10:00:00'));

        const configMock: any = {
            getConfig: jest.fn(),
            getScheduleById: jest.fn(),
            getGpioById: jest.fn(),
        };
        Config.instance = configMock;

        const returnedSchedule: ISchedule = {
            start: '10:30:00',
            end: '11:00:00',
            id: 'saturday',
            day: 'Saturday',
            enabled: true,
            states: [
                {
                    id: 'TEST_GPIO',
                    state: 'on',
                }
            ],
        };

        const testGpioConfig: IGPIOConfig = {
            id: 'TEST_GPIO',
            pin: 12,
            name: 'Test GPIO',
            normal: 'off',
        };

        when(configMock.getConfig).calledWith().mockReturnValue({});
        when(configMock.getScheduleById).calledWith('saturday').mockReturnValue(returnedSchedule);
        when(configMock.getGpioById).calledWith('TEST_GPIO').mockReturnValue(testGpioConfig);
        // @ts-ignore
        when(GPIO.getStatus).calledWith('TEST_GPIO').mockResolvedValue(true);

        const scheduleMessageMock: any = {};
        const revertMessageMock: any = {};

        const expectedMomentStart = moment('2022-01-01 10:30:00');
        const expectedMomentEnd = moment('2022-01-01 11:00:00');

        console.log({scheduleStart: expectedMomentStart,
            scheduleEnd: expectedMomentEnd});

        when(Message.generate).calledWith('TEST_GPIO', 'on', 'schedule', {
            scheduleStart: expectedMomentStart,
            scheduleEnd: expectedMomentEnd,
        }).mockReturnValue(scheduleMessageMock);
        when(Message.generate).calledWith('TEST_GPIO', 'off', 'schedule', {
            scheduleStart: expectedMomentStart,
            scheduleEnd: expectedMomentEnd,
        }).mockReturnValue(revertMessageMock);

        when(Log.stateExists).calledWith(scheduleMessageMock).mockReturnValue(true);
        when(Log.stateExists).calledWith(revertMessageMock).mockReturnValue(true);

        Scheduler.initialize();
        Scheduler.start();

        expect(Message.generate).toHaveBeenCalledWith('TEST_GPIO', 'on', 'schedule', {});
    });
});
