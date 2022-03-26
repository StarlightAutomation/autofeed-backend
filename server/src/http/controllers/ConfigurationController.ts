import AbstractController from "@http/AbstractController";
import {Request, Response} from "express";
import Config from "@services/config";
import GPIO, {GPIO_STATE} from "@services/gpio";
import Message from "@services/messaging/message";

export default class ConfigurationController extends AbstractController
{
    public boot(): void
    {
        this.index();
        this.updateSchedules();
        this.getDeviceStatus();
        this.controlDevice();
    }

    protected index (): void
    {
        this.app.get('/config', (req: Request, res: Response) => {
            res.status(200).json(Config.instance.getConfig());
        });
    }

    protected updateSchedules (): void
    {
        this.app.put('/schedules', async (req: Request, res: Response) => {
            const schedules = req.body.schedules || [];
            await Config.instance.updateSchedules(schedules);
            return res.status(200).json(Config.instance.getConfig());
        });
    }

    protected getDeviceStatus (): void
    {
        this.app.get('/device-status/:device', async (req: Request, res: Response) => {
            const gpio = Config.instance.getGpioById(req.params.device);
            if (!gpio || !gpio.id) {
                return this.modelNotFound(res);
            }

            const status = await GPIO.getStatus(gpio.id);
            return res.status(200).json({ status });
        });
    }

    protected controlDevice (): void
    {
        this.app.post('/control-device/:device', async (req: Request, res: Response) => {
            const gpio = Config.instance.getGpioById(req.params.device);
            if (!gpio || !gpio.id) {
                return this.modelNotFound(res);
            }

            const setting = req.body.setting as GPIO_STATE;
            if (!setting || (setting !== 'on' && setting !== 'off')) {
                return res.status(400).json({
                    error: 'Invalid setting: ' + req.body.setting,
                });
            }

            Message.dispatchUserAction(gpio.id, setting);
            return res.status(201).json({
                message: 'Action dispatched',
            });
        });
    }
}
