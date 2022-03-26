import ScriptCaller from "@services/ScriptCaller";

export type GPIO_CALLER = 'schedule'|'user'|'system';
export type GPIO_STATE = 'on'|'off';

export interface IGPIOAction
{
    actionId: string;
    gpioId: string;
    action: GPIO_STATE;
    caller: GPIO_CALLER;
    calledAt: Date;
    payload?: any;
}

export interface IGPIOState
{
    actionId: string;
    timestamp: Date;
    caller: GPIO_CALLER;
    state: GPIO_STATE;
}

export default class GPIO
{
    protected static states: { [gpioId: string]: Array<IGPIOState> } = {};

    public static pushState (gpioId: string, state: IGPIOState): void
    {
        if (!this.states[gpioId]) {
            this.states[gpioId] = [];
        }

        this.states[gpioId].push(state);
    }

    public static hasState (gpioId: string, state: IGPIOState): boolean
    {
        if (!this.states[gpioId]) return false;

        return this.states[gpioId].filter((s: IGPIOState) => s.actionId === state.actionId).length > 0;
    }

    public static stateWasOverridden (gpioId: string, state: IGPIOState): boolean
    {
        if (!this.states[gpioId]) return false;

        const index = this.states[gpioId].indexOf(state);
        const statesAfter = this.states[gpioId].slice(index);

        return statesAfter.filter((s: IGPIOState) => s.caller === 'user').length > 0;
    }

    public static async executeState (gpioId: string, state: IGPIOState): Promise<void>
    {
        await ScriptCaller.callGpioHL(gpioId, state.state === 'on');
    }

    public static async call (gpioId: string, setting: boolean): Promise<void>
    {
        try {
            await ScriptCaller.callGpioHL(gpioId, setting);
        } catch (e) {
            console.error(e);
        }
    }

    public static async getStatus (gpioId: string): Promise<boolean>
    {
        try {
            return await ScriptCaller.callGpioStatus(gpioId);
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}
