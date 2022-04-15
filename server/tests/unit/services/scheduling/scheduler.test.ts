jest.useFakeTimers();
jest.mock("@services/gpio");
jest.mock("@services/messaging/message");
jest.mock("@services/scheduling/log");
jest.mock("@services/mqtt/client");
import Scheduler from "@services/scheduling/scheduler";
import Message from "@services/messaging/message";
import Config, {IGPIOConfig} from "@services/config";
import GPIO from "@services/gpio";
import {ISchedule} from "@services/scheduling/scheduler";
import {when} from "jest-when";
import Log from "@services/scheduling/log";

describe ('test scheduler', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
        jest.clearAllTimers();

        // @ts-ignore
        Scheduler.instance = undefined;
    });

    const scheduleStartEndMatcher = when(({ scheduleStart, scheduleEnd }) => {
        expect(scheduleStart.format('Y-MM-DD HH:mm:ss')).toEqual('2022-01-01 10:30:00');
        expect(scheduleEnd.format('Y-MM-DD HH:mm:ss')).toEqual('2022-01-01 11:00:00');
        return true;
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
                },
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
                },
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

        const scheduleMessageMock: any = {
            state: 'scheduled-state',
            dispatchGpioAction: jest.fn(),
        };
        const revertMessageMock: any = {
            state: 'reverted-state',
            dispatchGpioAction: jest.fn(),
        };

        when(Message.generate).calledWith('TEST_GPIO', 'on', 'schedule', when((payload) => {
            expect(payload.scheduleStart.format('Y-MM-DD HH:mm:ss')).toBe('2022-01-01 10:30:00');
            expect(payload.scheduleEnd.format('Y-MM-DD HH:mm:ss')).toBe('2022-01-01 11:00:00');
            return true;
        })).mockReturnValue(scheduleMessageMock);

        when(Message.generate).calledWith('TEST_GPIO', 'off', 'schedule', when((payload) => {
            expect(payload.scheduleStart.format('Y-MM-DD HH:mm:ss')).toBe('2022-01-01 10:30:00');
            expect(payload.scheduleEnd.format('Y-MM-DD HH:mm:ss')).toBe('2022-01-01 11:00:00');
            return true;
        })).mockReturnValue(revertMessageMock);

        when(Log.stateExists).calledWith(scheduleMessageMock.state).mockReturnValue(true);
        when(Log.stateExists).calledWith(revertMessageMock.state).mockReturnValue(true);

        Scheduler.initialize();
        Scheduler.start();

        expect(scheduleMessageMock.dispatchGpioAction).not.toHaveBeenCalled();
        expect(revertMessageMock.dispatchGpioAction).not.toHaveBeenCalled();
    });

    test ('test start runs schedule and reverts states - reverts state when not yet reverted', async () => {
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
                },
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

        const scheduleMessageMock: any = {
            state: 'scheduled-state',
            dispatchGpioAction: jest.fn(),
        };
        const revertMessageMock: any = {
            state: 'reverted-state',
            dispatchGpioAction: jest.fn(),
        };

        when(Message.generate)
            .expectCalledWith('TEST_GPIO', 'on', 'schedule', scheduleStartEndMatcher)
            .mockReturnValueOnce(scheduleMessageMock);

        when(Message.generate)
            .expectCalledWith('TEST_GPIO', 'off', 'schedule', scheduleStartEndMatcher)
            .mockReturnValueOnce(revertMessageMock);

        when(Log.stateExists).expectCalledWith(scheduleMessageMock.state).mockReturnValueOnce(true);
        when(Log.stateExists).expectCalledWith(revertMessageMock.state).mockReturnValueOnce(false);

        Scheduler.initialize();
        Scheduler.start();
        await Promise.resolve();

        expect(Log.pushState).toHaveBeenCalledTimes(1);
        expect(Log.pushState).toHaveBeenCalledWith(revertMessageMock.state);
        expect(scheduleMessageMock.dispatchGpioAction).not.toHaveBeenCalled();
        expect(revertMessageMock.dispatchGpioAction).toHaveBeenCalledTimes(1);
    });

    test ('test start runs schedule and reverts states - dispatches scheduled action if schedule was not run', async () => {
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
                },
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

        const scheduleMessageMock: any = {
            state: 'scheduled-state',
            dispatchGpioAction: jest.fn(),
        };
        const revertMessageMock: any = {
            state: 'reverted-state',
            dispatchGpioAction: jest.fn(),
        };

        when(Message.generate)
            .expectCalledWith('TEST_GPIO', 'on', 'schedule', scheduleStartEndMatcher)
            .mockReturnValueOnce(scheduleMessageMock);

        when(Message.generate)
            .expectCalledWith('TEST_GPIO', 'off', 'schedule', scheduleStartEndMatcher)
            .mockReturnValueOnce(revertMessageMock);

        when(Log.stateExists).expectCalledWith(scheduleMessageMock.state).mockReturnValueOnce(false);
        when(Log.stateExists).expectCalledWith(revertMessageMock.state).mockReturnValueOnce(false);

        Scheduler.initialize();
        Scheduler.start();
        await Promise.resolve();

        expect(Log.pushState).toHaveBeenCalledTimes(1);
        expect(Log.pushState).toHaveBeenCalledWith(scheduleMessageMock.state);
        expect(scheduleMessageMock.dispatchGpioAction).toHaveBeenCalledTimes(1);
        expect(revertMessageMock.dispatchGpioAction).not.toHaveBeenCalled();
    });

    test ('test start runs schedule and sets scheduled states - does nothing if state is already set', async () => {
        // @ts-ignore
        Date.now = jest.fn(() => new Date('2022-01-01 10:32:00'));

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
                },
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

        Scheduler.initialize();
        Scheduler.start();
        await Promise.resolve();

        expect(Message.generate).toHaveBeenCalledTimes(0);
        expect(Log.stateExists).toHaveBeenCalledTimes(0);
    });

    test ('test start runs schedule and sets scheduled states - does nothing when state exists in log', async () => {
        // @ts-ignore
        Date.now = jest.fn(() => new Date('2022-01-01 10:32:00'));

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
                },
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

        const scheduleMessageMock: any = {
            state: 'scheduled-state',
            dispatchGpioAction: jest.fn(),
        };

        when(Message.generate)
            .expectCalledWith('TEST_GPIO', 'on', 'schedule', scheduleStartEndMatcher)
            .mockReturnValueOnce(scheduleMessageMock);

        when(Log.stateExists).expectCalledWith(scheduleMessageMock.state).mockReturnValueOnce(true);

        Scheduler.initialize();
        Scheduler.start();
        await Promise.resolve();

        expect(Log.pushState).not.toHaveBeenCalled();
        expect(scheduleMessageMock.dispatchGpioAction).not.toHaveBeenCalled();
    });

    test ('test start runs schedule and sets scheduled states - sets state when needed', async () => {
        // @ts-ignore
        Date.now = jest.fn(() => new Date('2022-01-01 10:35:00'));

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
                },
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

        const scheduleMessageMock: any = {
            state: 'scheduled-state',
            dispatchGpioAction: jest.fn(),
        };

        when(Message.generate)
            .expectCalledWith('TEST_GPIO', 'on', 'schedule', scheduleStartEndMatcher)
            .mockReturnValueOnce(scheduleMessageMock);

        when(Log.stateExists).expectCalledWith(scheduleMessageMock.state).mockReturnValueOnce(false);

        Scheduler.initialize();
        Scheduler.start();
        await Promise.resolve();

        expect(Log.pushState).toHaveBeenCalledTimes(1);
        expect(Log.pushState).toHaveBeenCalledWith(scheduleMessageMock.state);
        expect(scheduleMessageMock.dispatchGpioAction).toHaveBeenCalledTimes(1);
    });
});
