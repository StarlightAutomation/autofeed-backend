import AbstractController from "@http/AbstractController";
import {Request, Response} from "express";
import Config from "@services/config";

export default class StatusController extends AbstractController
{
    public boot(): void
    {
        this.index();
        this.updateSchedules();
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
}
