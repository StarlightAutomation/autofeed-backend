jest.mock("mqtt");
jest.mock("@services/messaging/message");
import {connect} from "mqtt";
import EventEmitter from "events";
import MqttClient from "@services/mqtt/client";
import Message from "@services/messaging/message";
import {IConfig} from "@services/config";
import {when} from "jest-when";
import each from "jest-each";

describe ('test MqttClient', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();

        // @ts-ignore
        MqttClient.instance = undefined;
    });

    test ('test initialize sets instance', () => {
        const config: IConfig = {
            gpio: [],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
            },
        };

        const result = MqttClient.initialize(config);
        expect(result).toBeInstanceOf(MqttClient);
        expect(MqttClient.instance).toBe(result);
    });

    test ('test initialize throws error when mqtt config not set', () => {
        const config: IConfig = {
            gpio: [],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
        };

        const init = () => MqttClient.initialize(config);
        expect(init).toThrow(new Error('MQTT is not configured'));
    });

    test ('test connect', () => {
        const config: IConfig = {
            gpio: [],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientOnEvent = jest.fn();

        const mqttClientMock: any = {
            on: mqttClientOnEvent,
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        MqttClient.initialize(config);
        MqttClient.connect();

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientOnEvent).toHaveBeenCalledTimes(5);
        expect(mqttClientOnEvent).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mqttClientOnEvent).toHaveBeenCalledWith('disconnect', expect.any(Function));
        expect(mqttClientOnEvent).toHaveBeenCalledWith('message', expect.any(Function));
        expect(mqttClientOnEvent).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mqttClientOnEvent).toHaveBeenCalledWith('close', expect.any(Function));
    });

    test ('test connect throws error if instance not initialized', () => {
        const conn = () => MqttClient.connect();

        expect(conn).toThrow(new Error('Client not initialized'));
        expect(connect).not.toHaveBeenCalled();
    });

    test ('test disconnect calls client.end with force=true', () => {
        const config: IConfig = {
            gpio: [],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientEnd = jest.fn();

        const mqttClientMock: any = {
            on: jest.fn(),
            end: mqttClientEnd,
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        MqttClient.initialize(config);
        MqttClient.connect();
        MqttClient.disconnect();

        expect(mqttClientEnd).toHaveBeenCalledTimes(1);
        expect(mqttClientEnd).toHaveBeenCalledWith(true);
    });

    each([
        [true, true],
        [false, false],
        [undefined, false],
    ]).test ('test isConnected returns connection status', (status: boolean|undefined, expectedStatus: boolean) => {
        const config: IConfig = {
            gpio: [],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = {
            on: jest.fn(),
            end: jest.fn(),
            connected: status,
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        MqttClient.initialize(config);
        MqttClient.connect();

        const result = MqttClient.isConnected();
        expect(result).toBe(expectedStatus);
    });
    
    test ('test gpio subscriptions initialized on connect', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log');

        const config: IConfig = {
            gpio: [
                {
                    id: 'TEST_GPIO',
                    normal: 'on',
                    name: 'Test GPIO',
                    pin: 12,
                },
            ],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback();
            });
            publish = jest.fn();
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        const expectedCommandTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/set';
        const expectedConfigTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/config';
        const expectedStateTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/state';

        MqttClient.initialize(config);
        MqttClient.connect();

        mqttClientMock.emit('connect');

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientMock.subscribe).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.subscribe).toHaveBeenCalledWith(expectedCommandTopic, expect.any(Function));
        expect(mqttClientMock.publish).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.publish).toHaveBeenCalledWith(expectedConfigTopic, JSON.stringify({
            name: 'Test GPIO',
            command_topic: expectedCommandTopic,
            state_topic: expectedStateTopic,
            device_class: 'switch',
            object_id: 'test_prefix_test_gpio',
            retain: true,
            state_off: 'off',
            state_on: 'on',
            unique_id: 'test_prefix_test_gpio',
        }));

        expect(consoleLogSpy).toHaveBeenCalledTimes(3);
        expect(consoleLogSpy).toHaveBeenCalledWith('[MQTT] Generating GPIO topics');
        expect(consoleLogSpy).toHaveBeenCalledWith('[MQTT] Creating subscription for GPIO TEST_GPIO on topic homeassistant/switch/test_prefix_test_gpio/switch');
        expect(consoleLogSpy).toHaveBeenCalledWith('[MQTT] Subscribed to command topic: homeassistant/switch/test_prefix_test_gpio/switch/set');
    });

    test ('test gpio subscription logs error when subscription returns error', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log');
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const config: IConfig = {
            gpio: [
                {
                    id: 'TEST_GPIO',
                    normal: 'on',
                    name: 'Test GPIO',
                    pin: 12,
                },
            ],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                haDiscoveryPrefix: 'discoveryPrefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback(new Error('test error'));
            });
            publish = jest.fn();
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        const expectedCommandTopic = 'homeassistant/discoveryPrefix/switch/test_prefix_test_gpio/switch/set';
        const expectedConfigTopic = 'homeassistant/discoveryPrefix/switch/test_prefix_test_gpio/switch/config';
        const expectedStateTopic = 'homeassistant/discoveryPrefix/switch/test_prefix_test_gpio/switch/state';

        MqttClient.initialize(config);
        MqttClient.connect();

        mqttClientMock.emit('connect');

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientMock.subscribe).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.subscribe).toHaveBeenCalledWith(expectedCommandTopic, expect.any(Function));
        expect(mqttClientMock.publish).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.publish).toHaveBeenCalledWith(expectedConfigTopic, JSON.stringify({
            name: 'Test GPIO',
            command_topic: expectedCommandTopic,
            state_topic: expectedStateTopic,
            device_class: 'switch',
            object_id: 'test_prefix_test_gpio',
            retain: true,
            state_off: 'off',
            state_on: 'on',
            unique_id: 'test_prefix_test_gpio',
        }));

        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        expect(consoleLogSpy).toHaveBeenCalledWith('[MQTT] Generating GPIO topics');
        expect(consoleLogSpy).toHaveBeenCalledWith('[MQTT] Creating subscription for GPIO TEST_GPIO on topic homeassistant/discoveryPrefix/switch/test_prefix_test_gpio/switch');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed subscribing to topic homeassistant/discoveryPrefix/switch/test_prefix_test_gpio/switch/set: test error');
    });

    test ('test publishGpioState', () => {
        const config: IConfig = {
            gpio: [
                {
                    id: 'TEST_GPIO',
                    normal: 'on',
                    name: 'Test GPIO',
                    pin: 12,
                },
            ],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback();
            });
            publish = jest.fn();
            connected = true;
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        const expectedStateTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/state';
        const expectedConfigTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/config';

        MqttClient.initialize(config);
        MqttClient.connect();

        mqttClientMock.emit('connect');
        MqttClient.publishGpioState('TEST_GPIO', 'on');

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientMock.subscribe).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.publish).toHaveBeenCalledTimes(2);

        expect(mqttClientMock.publish).toHaveBeenCalledWith(expectedConfigTopic, expect.any(String));
        expect(mqttClientMock.publish).toHaveBeenCalledWith(expectedStateTopic, 'on');
    });

    test ('test publishGpioState does nothing when instance not initialized', () => {
        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback();
            });
            publish = jest.fn();
            connected = true;
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        MqttClient.publishGpioState('TEST_GPIO', 'on');
        expect(mqttClientMock.publish).not.toHaveBeenCalled();
    });

    test ('test publishGpioState does nothing when gpio subscription not found', () => {
        const config: IConfig = {
            gpio: [
                {
                    id: 'TEST_GPIO',
                    normal: 'on',
                    name: 'Test GPIO',
                    pin: 12,
                },
            ],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback();
            });
            publish = jest.fn();
            connected = true;
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        const expectedStateTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/state';
        const expectedConfigTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/config';

        MqttClient.initialize(config);
        MqttClient.connect();

        mqttClientMock.emit('connect');
        MqttClient.publishGpioState('TEST_GPIO2', 'on');

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientMock.subscribe).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.publish).toHaveBeenCalledTimes(1);

        expect(mqttClientMock.publish).toHaveBeenCalledWith(expectedConfigTopic, expect.any(String));
        expect(mqttClientMock.publish).not.toHaveBeenCalledWith(expectedStateTopic, 'on');
    });

    each([
        ['ON', 'on'],
        ['OFF', 'off'],
    ]).test ('test handleMessage dispatches user action', (stateMessage: string, expectedDispatchedState: string) => {
        Message.dispatchUserAction = jest.fn();
        const config: IConfig = {
            gpio: [
                {
                    id: 'TEST_GPIO',
                    normal: 'on',
                    name: 'Test GPIO',
                    pin: 12,
                },
            ],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback();
            });
            publish = jest.fn();
            connected = true;
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        const commandTopic = 'homeassistant/switch/test_prefix_test_gpio/switch/set';

        MqttClient.initialize(config);
        MqttClient.connect();

        mqttClientMock.emit('connect');
        mqttClientMock.emit('message', commandTopic, stateMessage);

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientMock.subscribe).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.publish).toHaveBeenCalledTimes(1);

        expect(Message.dispatchUserAction).toHaveBeenCalledTimes(1);
        expect(Message.dispatchUserAction).toHaveBeenCalledWith('TEST_GPIO', expectedDispatchedState);
    });

    test ('test handleMessage does nothing when gpio subscription not found', () => {
        Message.dispatchUserAction = jest.fn();
        const config: IConfig = {
            gpio: [
                {
                    id: 'TEST_GPIO',
                    normal: 'on',
                    name: 'Test GPIO',
                    pin: 12,
                },
            ],
            paths: {
                scripts: {
                    python: '/path/to/python',
                },
                application: '/path/to/app',
            },
            schedules: [],
            mqtt: {
                host: 'http://localhost:1883',
                nodePrefix: 'test_prefix',
                username: 'testUsername',
                password: 'testPassword',
            },
        };

        const mqttClientMock: any = new class extends EventEmitter {
            subscribe = jest.fn().mockImplementation((topic: string, callback: any) => {
                callback();
            });
            publish = jest.fn();
            connected = true;
        };

        when(connect).calledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        }).mockReturnValue(mqttClientMock);

        const commandTopic = 'homeassistant/switch/test_prefix_test_gpio2/switch/set';

        MqttClient.initialize(config);
        MqttClient.connect();

        mqttClientMock.emit('connect');
        mqttClientMock.emit('message', commandTopic, 'ON');

        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith('http://localhost:1883', {
            username: 'testUsername',
            password: 'testPassword',
        });

        expect(mqttClientMock.subscribe).toHaveBeenCalledTimes(1);
        expect(mqttClientMock.publish).toHaveBeenCalledTimes(1);
        expect(Message.dispatchUserAction).not.toHaveBeenCalled();
    });
});
