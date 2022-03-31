import EventEmitter from "events";
import Config from "@services/config";
import moment from "moment";
import GPIO from "@services/gpio";
import util from "util";
import Message from "@services/messaging/message";
import MqttClient from "@services/mqtt/client";

export interface IScheduleState
{
    id: string;
    state: 'on'|'off';
}

export interface ISchedule
{
    id: string;
    day: string;
    enabled: boolean;
    copy?: string;
    start: string;
    end: string;
    states: Array<IScheduleState>;
}

export default class Scheduler extends EventEmitter
{
    public static instance: Scheduler;

    protected scheduleInterval?: NodeJS.Timer;
    protected mqttUpdateInterval?: NodeJS.Timer;

    public start (): void
    {
        this.scheduleInterval = setInterval(() => {
            this.runSchedule();
        }, 1000);

        this.updateMqttStates();
        this.mqttUpdateInterval = setInterval(() => {
            this.updateMqttStates();
        }, 60000);
    }

    protected updateMqttStates (): void
    {
        for (const gpio of Config.instance.getConfig().gpio) {
            GPIO.getStatus(gpio.id).then((on: boolean) => {
                MqttClient.publishGpioState(gpio.id, (on) ? 'on' : 'off');
            });
        }
    }

    protected runSchedule (): void
    {
        const currentDay = moment().format('dddd').toLowerCase();
        let schedule = Config.instance.getScheduleById(currentDay);
        if (!schedule || !schedule.enabled) return;

        if (schedule.copy !== undefined) {
            schedule = Config.instance.getScheduleById(schedule.copy);
            if (!schedule || !schedule.enabled) return;
        }

        const timeFormat = 'HH:mm:ss';
        const currentTime = moment(moment().format(timeFormat), timeFormat);

        const beforeTime = moment(schedule.start, timeFormat);
        const endTime = moment(schedule.end, timeFormat);

        if (currentTime.isBetween(beforeTime, endTime)) {
            this.setStates(schedule.states, beforeTime, endTime).catch((error) => {
                console.error(error);
            });
        } else {
            this.revertStates(schedule.states, beforeTime, endTime).catch((error) => {
                console.error(error);
            });
        }
    }

    protected async setStates (states: Array<IScheduleState>, scheduleStart: moment.Moment, scheduleEnd: moment.Moment): Promise<void>
    {
        states.forEach((state: IScheduleState) => {
            if (state.state === 'on') {
                this.setDeviceOn(state.id, scheduleStart, scheduleEnd);
            } else {
                this.setDeviceOff(state.id, scheduleStart, scheduleEnd);
            }
        });
    }

    protected async revertStates (states: Array<IScheduleState>, scheduleStart: moment.Moment, scheduleEnd: moment.Moment): Promise<void>
    {
        states.forEach((state: IScheduleState) => {
            if (state.state === 'on') {
                this.setDeviceOff(state.id, scheduleStart, scheduleEnd);
            } else {
                this.setDeviceOn(state.id, scheduleStart, scheduleEnd);
            }
        });
    }

    protected async setDeviceOn (id: string, scheduleStart: moment.Moment, scheduleEnd: moment.Moment): Promise<void>
    {
        const gpio = Config.instance.getGpioById(id);
        if (!gpio) return;

        const alreadyOn = await GPIO.getStatus(gpio.id);
        if (alreadyOn) return;

        console.log(util.format('[%s] Schedule - Set %s (pin %d) to ON', new Date().toISOString(), gpio.name, gpio.pin));
        Message.dispatchScheduledAction(id, 'on', { scheduleStart, scheduleEnd });
    }

    protected async setDeviceOff (id: string, scheduleStart: moment.Moment, scheduleEnd: moment.Moment): Promise<void>
    {
        const gpio = Config.instance.getGpioById(id);
        if (!gpio) return;

        const alreadyOn = await GPIO.getStatus(gpio.id);
        if (!alreadyOn) return;

        console.log(util.format('[%s] Schedule - Set %s (pin %d) to OFF', new Date().toISOString(), gpio.name, gpio.pin));
        Message.dispatchScheduledAction(id, 'off', { scheduleStart, scheduleEnd });
    }
}
