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
    gpioId: string;
    actionId: string;
    timestamp: Date;
    caller: GPIO_CALLER;
    state: GPIO_STATE;
}

export default class GPIO
{
    protected static states: { [gpioId: string]: Array<IGPIOState> } = {};

    public static pushState (state: IGPIOState): void
    {
        if (!this.states[state.gpioId]) {
            this.states[state.gpioId] = [];
        }

        this.states[state.gpioId].push(state);
    }

    public static hasState (state: IGPIOState): boolean
    {
        if (!this.states[state.gpioId]) return false;

        return this.states[state.gpioId].filter((s: IGPIOState) => s.actionId === state.actionId).length > 0;
    }

    public static stateWasOverridden (state: IGPIOState): boolean
    {
        if (!this.states[state.gpioId]) return false;

        const index = this.states[state.gpioId].indexOf(state);
        const statesAfter = this.states[state.gpioId].slice(index);

        return statesAfter.filter((s: IGPIOState) => s.caller === 'user').length > 0;
    }

    public static async executeState (state: IGPIOState): Promise<void>
    {
        await ScriptCaller.callGpioHL(state.gpioId, state.state === 'on');
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
