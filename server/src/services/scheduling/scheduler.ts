import Config from "@services/config";
import moment from "moment";
import GPIO from "@services/gpio";
import Message from "@services/messaging/message";
import Log from "@services/scheduling/log";
import MqttClient from "@services/mqtt/client";
const debug = require("debug")("autofeed-scheduler");

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
    start: string;
    end: string;
    states: Array<IScheduleState>;
}

export default class Scheduler
{
    protected static instance: Scheduler;

    protected scheduleInterval?: NodeJS.Timer;
    protected mqttInterval?: NodeJS.Timer;

    public static initialize (): Scheduler
    {
        if (!this.instance) {
            this.instance = new Scheduler();
            debug('created scheduler instance');
        }

        debug('scheduler initialized');
        return this.instance;
    }

    public static start (): void
    {
        if (!this.instance) throw new Error('Scheduler not initialized');
        this.instance.start();
        debug('scheduler started');
    }

    protected start (): void
    {
        this.bootIntervals();
        this.runSchedule();
    }

    protected stop (): void
    {
        if (this.scheduleInterval) clearInterval(this.scheduleInterval);
        if (this.mqttInterval) clearInterval(this.mqttInterval);
    }

    protected bootIntervals (): void
    {
        const scheduleInterval = Config.instance.getConfig().scheduleInterval || 1000;
        const mqttInterval = Config.instance.getConfig().mqtt?.refreshInterval || 60000;

        debug('setting schedule interval with %dms', scheduleInterval);

        this.scheduleInterval = setInterval(() => this.runSchedule(), scheduleInterval);
        if (Config.instance.getConfig().mqtt) {
            debug('setting mqtt interval with %dms', mqttInterval);
            this.mqttInterval = setInterval(() => this.updateMqttStates(), mqttInterval);
        }
    }

    protected updateMqttStates (): void
    {
        for (const gpio of Config.instance.getConfig().gpio) {
            GPIO.getStatus(gpio.id).then((on: boolean) => {
                MqttClient.publishGpioState(gpio.id, (on) ? 'on' : 'off');
            });
        }
        debug('updated mqtt states');
    }

    protected runSchedule (): void
    {
        const currentDay = moment().format('dddd').toLowerCase();
        const schedule = Config.instance.getScheduleById(currentDay);
        if (!schedule || !schedule.enabled) return;

        const timeFormat = 'HH:mm:ss';
        const currentTime = moment(moment().format(timeFormat), timeFormat);

        debug('running schedule for %s %s', currentDay, currentTime);

        const beforeTime = moment(schedule.start, timeFormat);
        const endTime = moment(schedule.end, timeFormat);

        if (currentTime.isBetween(beforeTime, endTime)) {
            /**
             * Current time is within scheduled time range
             */
            this.dispatchStates(schedule.states, beforeTime, endTime);
        } else {
            /**
             * Current time is outside of scheduled time range
             *
             * Check the state logs:
             * - Ensure that the schedule was run
             *  * If schedule was not run, potentially run it now
             * - Ensure that the states were reverted from the schedule
             *  * If states were not reverted, potentially revert now
             */
            this.checkStateLogs(schedule.states, beforeTime, endTime);
        }
    }

    protected dispatchStates (states: Array<IScheduleState>, scheduleStart: moment.Moment, scheduleEnd: moment.Moment): void
    {
        states.forEach(async (state: IScheduleState) => {
            const gpio = Config.instance.getGpioById(state.id);
            if (!gpio) return;

            const status = state.state;
            const statusAsBool = status === 'on';

            debug('in schedule - gpio %s desired state \'%s\'', gpio.id, status);

            // Check if current state is already desired state
            const currentStatus = await GPIO.getStatus(gpio.id);
            if (currentStatus === statusAsBool) return;

            const message = Message.generate(gpio.id, status, 'schedule', {
                scheduleStart,
                scheduleEnd,
            });

            /**
             * If the state log does not yet have this state, dispatch it
             */
            if (!Log.stateExists(message.state)) {
                debug('setting %s state to %s', gpio.id, status);
                this.dispatchStateMessage(message);
            }
        });
    }

    protected checkStateLogs (states: Array<IScheduleState>, scheduleStart: moment.Moment, scheduleEnd: moment.Moment): void
    {
        states.forEach(async (state: IScheduleState) => {
            const gpio = Config.instance.getGpioById(state.id);
            if (!gpio) return;

            const status = state.state;
            const statusAsBool = status === 'on';

            const revertedStatusAsBool = !statusAsBool;
            const revertedStatus = revertedStatusAsBool ? 'on' : 'off';

            debug('outside schedule - gpio %s desired state %s', gpio.id, revertedStatus);

            // Check if states were already reverted
            const currentStatus = await GPIO.getStatus(gpio.id);
            if (currentStatus === revertedStatusAsBool) return;

            debug('unexpected state for %s (%s, expected %s)', gpio.id, currentStatus ? 'on' : 'off', revertedStatus);

            const scheduleMessage = Message.generate(gpio.id, status, 'schedule', { scheduleStart, scheduleEnd });
            const revertMessage = Message.generate(gpio.id, revertedStatus, 'schedule', { scheduleStart, scheduleEnd });

            const scheduleWasRun = Log.stateExists(scheduleMessage.state);
            const scheduleWasReverted = Log.stateExists(revertMessage.state);

            if (!scheduleWasRun) {
                debug('schedule was not run for %s, dispatching now', gpio.id);
                console.log(Log.getLogs());
                this.dispatchStateMessage(scheduleMessage);
                return;
            }

            if (!scheduleWasReverted) {
                debug('schedule was never reverted for %s, dispatching now', gpio.id);
                this.dispatchStateMessage(revertMessage);
            }
        });
    }

    protected dispatchStateMessage (message: Message): void
    {
        Log.pushState(message.state);
        message.dispatchGpioAction();
    }
}
