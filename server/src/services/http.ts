import AbstractController from "@http/AbstractController";
import {Application, Express, Request, Response} from "express";
import ModelNotFound from "@app/exceptions/ModelNotFound";
import util from "util";
import {wsExpress, listen} from "wsexpress";
const express = require('express');

export default class HttpService
{
    public static instance: HttpService;

    protected controllers: Array<(express: Application) => AbstractController> = [];
    protected port: number;

    protected app: Express;

    constructor(port: number, controllers: Array<(express: Application) => AbstractController>)
    {
        this.port = port;
        this.controllers = controllers;

        this.app = express();
        this.app.use(express.json());
    }

    public getExpress (): Application
    {
        return this.app;
    }

    public boot (): void
    {
        this.app.use((req: Request, res: Response, next: CallableFunction) => {
            console.log(util.format('[%s] %s %s', new Date().toISOString(), req.method, req.path));
            next();
        });

        const controllers: Array<AbstractController> = [];
        for (const i in this.controllers) {
            const controller = this.controllers[i](this.app);
            controllers.push(controller);
        }

        this.bootControllerRoutes(controllers);

        // wsexpress
        this.app.use(wsExpress({ app: this.app }));

        this.bootControllerMiddleware(controllers);

        this.app.use((err: any, req: Request, res: Response, next: any) => {
            switch (true) {
                case err instanceof ModelNotFound:
                    return res.status(404).json({
                        message: 'This model was not found',
                    });
                default:
                    console.error(err);
                    return res.status(500).json({
                        message: 'Something went wrong',
                    });
            }

            /**
             * This code is unreachable. The only reason it exists is to satisfy eslint.
             * next() is required to be passed to this middleware in order for it to handle
             * validation errors, but since this is always the last middleware in the stack,
             * there is no next() request. Thus, next() is unused. Which of course eslint
             * complains about.
             *
             * So here we are.
             */
            next();
        });
    }

    public start (): void
    {
        listen({ app: this.app }, this.port, () => {
            console.log('listening');
        });
    }

    protected bootControllerRoutes (controllers: Array<AbstractController>): void
    {
        controllers.map((controller: AbstractController) => controller.boot());
    }

    protected bootControllerMiddleware (controllers: Array<AbstractController>): void
    {
        controllers.map((controller: AbstractController) => controller.middleware());
    }
}
