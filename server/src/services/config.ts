import {ISchedule} from "@services/scheduler";
import util from "util";
const fs = require("fs");

export interface IMqttConfig
{
    host: string;
    nodePrefix: string;
    haDiscoveryPrefix?: string;
    username?: string;
    password?: string;
}

export interface IGPIOConfig
{
    id: string;
    name: string;
    pin: number;
    normal: 'on'|'off';
}

export interface IConfig
{
    gpio: Array<IGPIOConfig>;

    paths: {
        scripts: {
            python: string,
        },
        application: string,
    };

    schedules: Array<ISchedule>;
    mqtt?: IMqttConfig;
}

export default class Config
{
    public static instance: Config;

    protected config: IConfig;

    public constructor (config: IConfig)
    {
        this.config = config;
    }

    public getConfig (): IConfig
    {
        return this.config;
    }

    public getGpioById (id: string): IGPIOConfig | null
    {
        const filtered = this.config.gpio.filter((gpioConfig: IGPIOConfig) => gpioConfig.id === id);
        return (filtered.length > 0) ? filtered[0] : null;
    }

    public getSchedules (): Array<ISchedule>
    {
        return this.config.schedules;
    }

    public getScheduleById (id: string): ISchedule | null
    {
        const filtered = this.config.schedules.filter((schedule: ISchedule) => schedule.id === id);
        return (filtered.length > 0) ? filtered[0] : null;
    }

    public async updateSchedules (schedules: Array<ISchedule>): Promise<void>
    {
        this.config.schedules = schedules;
        await this.writeConfig();
    }

    public async updateGpioConfig (gpioConfig: Array<IGPIOConfig>): Promise<void>
    {
        this.config.gpio = gpioConfig;
        await this.writeConfig();
    }

    public async updateMqttConfig (mqttConfig?: IMqttConfig): Promise<void>
    {
        this.config.mqtt = mqttConfig;
        await this.writeConfig();
    }

    protected async writeConfig (): Promise<void>
    {
        await fs.writeFileSync(util.format('%s/config.json', process.env.DATA_DIR), JSON.stringify(this.config));
    }
}
