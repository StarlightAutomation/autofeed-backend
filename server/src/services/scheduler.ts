import EventEmitter from "events";
import Config from "@services/config";
import moment from "moment";
import GPIO from "@services/gpio";
import util from "util";
import ScriptCaller from "@services/ScriptCaller";

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

    public start (): void
    {
        this.scheduleInterval = setInterval(() => {
            this.runSchedule();
        }, 1000);
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
            this.setStates(schedule.states).catch((error) => {
                console.error(error);
            });
        } else {
            this.revertStates(schedule.states).catch((error) => {
                console.error(error);
            });
        }
    }

    protected async setStates (states: Array<IScheduleState>): Promise<void>
    {
        states.forEach((state: IScheduleState) => {
            if (state.state === 'on') {
                this.setDeviceOn(state.id);
            } else {
                this.setDeviceOff(state.id);
            }
        });
    }

    protected async revertStates (states: Array<IScheduleState>): Promise<void>
    {
        states.forEach((state: IScheduleState) => {
            if (state.state === 'on') {
                this.setDeviceOff(state.id);
            } else {
                this.setDeviceOn(state.id);
            }
        });
    }

    protected async setDeviceOn (id: string): Promise<void>
    {
        const gpio = Config.instance.getGpioById(id);
        if (!gpio) return;

        const alreadyOn = await GPIO.getStatus(gpio.id);
        if (alreadyOn) return;

        console.log(util.format('[%s] Set %s (pin %d) to ON', new Date().toISOString(), gpio.name, gpio.pin));
        await ScriptCaller.callGpioHL(gpio.id, true);
    }

    protected async setDeviceOff (id: string): Promise<void>
    {
        const gpio = Config.instance.getGpioById(id);
        if (!gpio) return;

        const alreadyOn = await GPIO.getStatus(gpio.id);
        if (!alreadyOn) return;

        console.log(util.format('[%s] Set %s (pin %d) to OFF', new Date().toISOString(), gpio.name, gpio.pin));
        await ScriptCaller.callGpioHL(gpio.id, false);
    }
}
