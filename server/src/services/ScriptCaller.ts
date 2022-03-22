import Config from "@services/config";
import util from "util";
import {ExecException} from "child_process";
const { exec } = require("child_process");

export default class ScriptCaller
{
    public static async callGpioHL (gpioId: string, setting: boolean): Promise<boolean>
    {
        return new Promise((resolve, reject) => {
            const gpioConfig = Config.instance.getGpioById(gpioId);
            if (!gpioConfig) {
                reject(new Error(util.format('%s is not a valid GPIO configuration', gpioId)));
                return;
            }

            const settingAsState = (setting) ? 'on' : 'off';

            /**
             * This will essentially "reverse" the state setting based on the relay's NO/NC state.
             *
             * If the `normal` setting of the relay is 'on' and the desired state is 'on', then the GPIO pin
             * should be set to LOW. Likewise if the desired state is `off`, then the GPIO pin should be set
             * to HIGH.
             *
             * If the `normal` setting of the relay is 'off' and the desired state is 'on', then the GPIO pin
             * should be set to HIGH. Likewise if the desired state is 'off', then the GPIO pin should be set
             * to LOW.
             *
             * This condition will perform this operation by checking if the 'normal' state is equal to the desired
             * state. If this is true, then the pin will be set to HIGH (e.g. when normal is off and desired state is
             * on, then set to HIGH; when normal is on and desired state is on, then set to LOW; so on and so forth).
             */
            const expectedSetting = (gpioConfig.normal !== settingAsState) ? 'HIGH' : 'LOW';
            const settingToUse = gpioConfig.normal !== settingAsState;

            exec(
                util.format('python3 %s/gpio_hl.py %d %d', process.env.SCRIPTS_DIR, gpioConfig.pin, Number(settingToUse)),
                (error: ExecException | null, stdout: string) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (stdout.includes(util.format('Pin %d set to %s', gpioConfig.pin, expectedSetting))) {
                        resolve(true);
                        return;
                    }

                    reject(new Error(stdout));
                });
        });
    }

    public static async callGpioStatus (gpioId: string): Promise<boolean>
    {
        return new Promise((resolve, reject) => {
            const gpioConfig = Config.instance.getGpioById(gpioId);
            if (!gpioConfig) {
                reject(new Error(util.format('%s is not a valid GPIO configuration', gpioId)));
                return;
            }

            exec(
                util.format('python3 %s/gpio_status.py %d', process.env.SCRIPTS_DIR, gpioConfig.pin),
                (error: ExecException | null, stdout: string) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    const state = String(stdout) === '1' ? 'on' : 'off';

                    /**
                     * This will essentially "reverse" the state based on the NO/NC status of the relay.
                     *
                     * If `state` is 'on' and gpioConfig.normal is 'off' (meaning the device is on the NO terminal and
                     * is therefore 'normally off'), then this method will return `true` (aka, the device is 'on' since the
                     * relay is receiving a signal and turning on the power).
                     *
                     * If the `state` is `on` and gpioConfig.normal is 'on' (meaning the device is on the NC terminal and
                     * is therefore 'normally on'), then this method will return `false` (aka, the device is 'off' since the
                     * relay is receiving a signal and turning off the power).
                     *
                     * And vice versa
                     */
                    resolve(gpioConfig.normal !== state);
                }
            );
        });
    }
}
