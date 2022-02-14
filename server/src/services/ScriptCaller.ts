import Config from "@services/config";
import util from "util";
import {ExecException} from "child_process";
const { exec } = require("child_process");

export default class ScriptCaller
{
    public static async callGpioHL (pin: string, setting: boolean): Promise<boolean>
    {
        return new Promise((resolve, reject) => {
            const gpioConfig = Config.instance.getGpioById(pin);
            if (!gpioConfig) {
                reject(new Error(util.format('%s is not a valid GPIO configuration', pin)));
                return;
            }

            const expectedSetting = (setting) ? 'HIGH' : 'LOW';
            exec(
                util.format('python3 %s/gpio_hl.py %d %d', process.env.SCRIPTS_DIR, gpioConfig.pin, Number(setting)),
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

    public static async callGpioStatus (pin: string): Promise<string>
    {
        return new Promise((resolve, reject) => {
            const gpioConfig = Config.instance.getGpioById(pin);
            if (!gpioConfig) {
                reject(new Error(util.format('%s is not a valid GPIO configuration', pin)));
                return;
            }

            exec(
                util.format('python3 %s/gpio_status.py %d', process.env.SCRIPTS_DIR, gpioConfig.pin),
                (error: ExecException | null, stdout: string) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(stdout);
                }
            );
        });
    }
}
