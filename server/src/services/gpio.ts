import ScriptCaller from "@services/ScriptCaller";

export default class GPIO
{
    public static async call (gpioId: string, setting: boolean): Promise<void>
    {
        try {
            await ScriptCaller.callGpioHL(gpioId, setting);
        } catch (e) {
            //
        }
    }

    public static async getStatus (gpioId: string): Promise<boolean>
    {
        try {
            return await ScriptCaller.callGpioStatus(gpioId);
        } catch (e) {
            return false;
        }
    }
}
