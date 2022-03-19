import ScriptCaller from "@services/ScriptCaller";

export default class GPIO
{
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
            return await ScriptCaller.callGpioStatus(pin);
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
