import AbstractController from "@http/AbstractController";
import {Request, Response} from "express";

export default class StatusController extends AbstractController
{
    public boot(): void
    {
        this.index();
    }

    protected index (): void
    {
        this.app.get('/status', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'OK',
                version: process.env.NODE_ENV === 'production' ? process.env.VERSION || 'N/A' : 'dev',
            });
        });
    }
}
