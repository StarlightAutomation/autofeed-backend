import {IGPIOState} from "@services/gpio";

export type LOG_ORDER = 'asc'|'desc';

export default class Log
{
    public static LOG_ORDER_ASC: LOG_ORDER = 'asc';
    public static LOG_ORDER_DESC: LOG_ORDER = 'desc';

    protected static stateLog: Array<IGPIOState> = [];

    public static pushState (state: IGPIOState): void
    {
        this.stateLog.push(state);
    }

    public static getLogs (order: LOG_ORDER = this.LOG_ORDER_ASC): Array<IGPIOState>
    {
        return (order === this.LOG_ORDER_ASC) ? this.stateLog : this.stateLog.reverse();
    }

    public static stateExists (state: IGPIOState): boolean
    {
        return this.stateLog.indexOf(state) !== -1;
    }
}
