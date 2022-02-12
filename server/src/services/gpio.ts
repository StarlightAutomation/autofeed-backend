import ScriptCaller from "@services/ScriptCaller";

export const GPIO_VALVE_MAIN = 'VALVE_MAIN';
export const GPIO_PUMP_STIR = 'PUMP_STIR';
export const GPIO_PUMP_EGRESS  = 'PUMP_EGRESS';
export const GPIO_PUMP_AIR = 'PUMP_AIR';

export default class GPIO
{
    public static async mainValveOn (): Promise<void>
    {
        await this.call(GPIO_VALVE_MAIN, true);
    }

    public static async mainValveOff (): Promise<void>
    {
        await this.call(GPIO_VALVE_MAIN, false);
    }

    public static async stirPumpOn (): Promise<void>
    {
        await this.call(GPIO_PUMP_STIR, true);
    }

    public static async stirPumpOff (): Promise<void>
    {
        await this.call(GPIO_PUMP_STIR, false);
    }

    public static async egressPumpOn (): Promise<void>
    {
        await this.call(GPIO_PUMP_EGRESS, true);
    }

    public static async egressPumpOff (): Promise<void>
    {
        await this.call(GPIO_PUMP_EGRESS, false);
    }

    public static async aerationPumpOn (): Promise<void>
    {
        await this.call(GPIO_PUMP_AIR, true);
    }

    public static async aerationPumpOff (): Promise<void>
    {
        await this.call(GPIO_PUMP_AIR, false);
    }

    public static async isMainValveOn (): Promise<boolean>
    {
        return await this.getStatus(GPIO_VALVE_MAIN);
    }

    public static async isStirPumpOn (): Promise<boolean>
    {
        return await this.getStatus(GPIO_PUMP_STIR);
    }

    public static async isEgressPumpOn (): Promise<boolean>
    {
        return await this.getStatus(GPIO_PUMP_EGRESS);
    }

    public static async isAerationPumpOn (): Promise<boolean>
    {
        return await this.getStatus(GPIO_PUMP_AIR);
    }

    protected static async call (pin: string, setting: boolean): Promise<void>
    {
        try {
            await ScriptCaller.callGpioHL(pin, setting);
        } catch (e) {
            //
        }
    }

    public static async getStatus (pin: string): Promise<boolean>
    {
        try {
            const status = await ScriptCaller.callGpioStatus(pin);
            return status.includes('status=1');
        } catch (e) {
            return false;
        }
    }
}
