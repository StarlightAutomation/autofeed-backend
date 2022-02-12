import AbstractController from "../http/AbstractController";
import {Application, Request, Response} from "express";
import * as express from 'express';
import ModelNotFound from "@app/exceptions/ModelNotFound";
import util from "util";
const server = require('express');

export default class HttpService
{
    public static instance: HttpService;

    protected controllers: Array<(express: Application) => AbstractController> = [];
    protected port: number;

    protected app: Application;

    constructor(port: number, controllers: Array<(express: Application) => AbstractController>)
    {
        this.port = port;
        this.controllers = controllers;

        this.app = server();
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

        for (const i in this.controllers) {
            const controller = this.controllers[i](this.app);

            controller.middleware();
            controller.boot();
        }

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
        this.app.listen(this.port);
    }
}
