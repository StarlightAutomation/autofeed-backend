require('module-alias/register');
require('dotenv').config();
import HttpService from "@services/http";
import Scheduler from "@services/scheduler";
import {configFileExists, copyBaseConfiguration, loadControllers} from "@app/utils";
import Config from "@services/config";
import util from "util";
import path from "path";

const {version} = require("../package.json");
process.env.VERSION = version;

process.env.DATA_DIR = (process.env.DATA_DIR) ? path.resolve(process.env.DATA_DIR) : '/etc/autofeed/data';
process.env.APP_DIR = (process.env.APP_DIR) ? path.resolve(process.env.APP_DIR) : '/etc/autofeed/app';
process.env.CLIENT_DIR = (process.env.CLIENT_DIR) ? path.resolve(process.env.CLIENT_DIR) : '/etc/autofeed/client';
process.env.SCRIPTS_DIR = (process.env.SCRIPTS_DIR) ? path.resolve(process.env.SCRIPTS_DIR) : '/etc/autofeed/py-scripts';

if (!configFileExists(util.format('%s/config.json', process.env.DATA_DIR))) {
    // Move base_configuration.json
    console.log('Moving %s/base_configuration.json to %s/config.json', process.env.DATA_DIR, process.env.DATA_DIR);
    copyBaseConfiguration(
        util.format('%s/base_configuration.json', process.env.DATA_DIR),
        util.format('%s/config.json', process.env.DATA_DIR)
    );
}

const baseConfig = require(util.format('%s/config.json', process.env.DATA_DIR));

console.log('Starting Application');
console.log(util.format('DIYAutoFeed v%s', version));

const controllers = loadControllers();
const http = new HttpService(process.env.API_PORT ? Number(process.env.API_PORT) : 8080, controllers);
HttpService.instance = http;

const config = new Config(baseConfig);
Config.instance = config;

const scheduler = new Scheduler();
scheduler.start();

http.boot();
http.start();
console.log('Running');