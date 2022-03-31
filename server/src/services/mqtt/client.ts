import {IConfig, IMqttConfig} from "@services/config";
import {Client, connect} from "mqtt";
import util from "util";
import {GPIO_STATE} from "@services/gpio";
import Message from "@services/messaging/message";

export const HA_TOPIC_TEMPLATE = '<component>/<nodeId>/<objectId>';

export interface IGpioSubscription
{
    gpioId: string;
    topics: {
        config: string;
        state: string;
        command: string;
    };
}

export default class MqttClient
{
    public static instance: MqttClient;

    protected config: IConfig;
    protected mqttConfig: IMqttConfig

    protected client?: Client;

    protected subscriptions: Array<IGpioSubscription> = [];

    protected constructor (config: IConfig)
    {
        this.config = config;
        if (!config.mqtt) {
            throw new Error('MQTT is not configured');
        }

        this.mqttConfig = config.mqtt;
    }

    public static initialize (config: IConfig): MqttClient
    {
        this.instance = new MqttClient(config);
        return this.instance;
    }

    public static disconnect (): void
    {
        this.instance?.client?.end(true);
    }

    public static isConnected (): boolean
    {
        return this.instance?.client?.connected || false;
    }

    public static connect (): void
    {
        if (!this.instance) throw new Error('Client not initialized');

        this.instance.client = connect(this.instance.mqttConfig.host, {
            username: this.instance.mqttConfig.username,
            password: this.instance.mqttConfig.password,
        });

        this.instance.client.on('connect', this.instance.handleConnect.bind(this.instance));
        this.instance.client.on('disconnect', this.instance.handleDisconnect.bind(this.instance));
        this.instance.client.on('message', this.instance.handleMessage.bind(this.instance));
        this.instance.client.on('error', this.instance.handleError.bind(this.instance));
        this.instance.client.on('close', this.instance.handleError.bind(this.instance));
    }

    public static publishGpioState (gpioId: string, state: string): void
    {
        if (!this.instance || !this.instance.client?.connected) return;

        const gpioSubscription = this.instance.findGpioSubscriptionByGpioId(gpioId);
        if (!gpioSubscription) return;

        this.instance.client?.publish(gpioSubscription.topics.state, state);
    }

    protected initGpioSubscriptions (): void
    {
        this.subscriptions = [];

        console.log('[MQTT] Generating GPIO topics');
        for (const gpio of this.config.gpio) {
            const topicTemplate = HA_TOPIC_TEMPLATE
                .replace('<component>', 'switch')
                .replace('<nodeId>', this.mqttConfig.nodePrefix + '_' + gpio.id.toLowerCase())
                .replace('<objectId>', 'switch');

            const baseTopic = 'homeassistant/' + ((this.mqttConfig.haDiscoveryPrefix) ? this.mqttConfig.haDiscoveryPrefix + '/' : '') + topicTemplate;
            console.log(util.format('[MQTT] Creating subscription for GPIO %s on topic %s', gpio.id, baseTopic));

            const subscription: IGpioSubscription = {
                gpioId: gpio.id,
                topics: {
                    config: util.format('%s/config', baseTopic),
                    state: util.format('%s/state', baseTopic),
                    command: util.format('%s/set', baseTopic),
                },
            };

            this.client?.subscribe(subscription.topics.command, (error?: Error) => {
                if (!error) {
                    this.subscriptions.push(subscription);
                    console.log(util.format('[MQTT] Subscribed to command topic: %s', subscription.topics.command));
                    return;
                }

                console.error('Failed subscribing to topic ' + subscription.topics.command + ': ' + error.message);
            });

            this.client?.publish(subscription.topics.config, JSON.stringify({
                name: gpio.name,
                command_topic: subscription.topics.command,
                state_topic: subscription.topics.state,
                device_class: 'switch',
                object_id: this.mqttConfig.nodePrefix + '_' + gpio.id.toLowerCase(),
                retain: true,
                state_off: 'off',
                state_on: 'on',
                unique_id: this.mqttConfig.nodePrefix + '_' + gpio.id.toLowerCase(),
            }));
        }
    }

    protected handleMessage (topic: string, message: Buffer): void
    {
        const gpioSubscription = this.findGpioSubscriptionByTopic(topic);
        if (!gpioSubscription) return;

        Message.dispatchUserAction(gpioSubscription.gpioId.toUpperCase(), message.toString().toLowerCase() as GPIO_STATE);
    }

    protected findGpioSubscriptionByGpioId (gpioId: string): IGpioSubscription | null
    {
        return this.subscriptions.filter((subscription: IGpioSubscription) => subscription.gpioId.toLowerCase() === gpioId.toLowerCase())[0] || null;
    }

    protected findGpioSubscriptionByTopic (topic: string): IGpioSubscription | null
    {
        const split = topic.split('/');
        const gpioId = split[2].replace(this.mqttConfig.nodePrefix + '_', '');

        return this.subscriptions.filter((subscription: IGpioSubscription) => subscription.gpioId.toLowerCase() === gpioId.toLowerCase())[0] || null;
    }

    protected handleConnect (): void
    {
        this.initGpioSubscriptions();
    }

    protected handleDisconnect (): void
    {
        console.log('disconnected');
    }

    protected handleError (error: Error): void
    {
        console.log('error', error);
    }

    protected handleClose (error?: Error): void
    {
        console.log('closed. error: ' + error?.message);
    }
}
