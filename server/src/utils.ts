import {Application} from "express";
import AbstractController from "@http/AbstractController";
import util from "util";
const fs = require("fs");

export const directoryListing = (path: string): Array<string> => {
    const listing: Array<string> = [];
    const ls = fs.readdirSync(path);

    for (const i in ls) {
        const p = ls[i];

        const fullPath = path + '/' + p;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            listing.push(...directoryListing(fullPath));
        } else {
            listing.push(fullPath);
        }
    }

    return listing;
};

export const loadControllers = (path: string = process.cwd() + '/build/http/controllers'): Array<(express: Application) => AbstractController> => {
    const listing = directoryListing(path);
    const controllers: Array<(express: Application) => AbstractController> = [];

    for (const i in listing) {
        const path = listing[i];
        if (path.substring(path.length - 3) !== '.js') continue;

        try {
            const controllerClass = require(path).default;
            const controller = (express: Application) => new controllerClass(express);

            controllers.push(controller);
            console.log(util.format('Loaded controller: %s', controllerClass.name));
        } catch (e) {
            console.error(util.format('Could not load controller at %s: %s', path, e));
        }
    }

    return controllers;
};
