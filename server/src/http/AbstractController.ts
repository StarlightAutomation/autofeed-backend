import {Application, Request, Response} from "express";

export default abstract class AbstractController
{
    protected app: Application;

    protected constructor (app: Application)
    {
        this.app = app;
    }

    public abstract boot (): void;

    public middleware (): void
    {
        return;
    }

    protected expands (req: Request): Array<any>
    {
        const relations: Array<any> = [];
        const expands: any = req.query?.expand || [];

        for (const i in expands) {
            const query = expands[i];
            const split = query.split('.');

            if (split.length === 1) {
                relations.push({ association: split[0] });
                continue;
            }

            relations.push({ association: split[0], include: [split[1]]});
        }

        return relations;
    }

    protected unauthorizedResponse (res: Response): void
    {
        res.status(401).json({
            message: 'This action is not authorized',
        });
    }

    protected invalidAuthorizationCodeResponse (res: Response): void
    {
        res.status(403).json({
            message: 'Authorization code is invalid',
        });
    }

    protected invalidRequest (res: Response): void
    {
        res.status(400).json({
            message: 'Invalid request',
        });
    }

    protected modelNotFound (res: Response): void
    {
        res.status(404).json({
            message: 'This resource was not found',
        });
    }
}
