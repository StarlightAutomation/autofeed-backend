require('module-alias/register');
import HttpService from "@services/http";
import Scheduler from "@services/scheduler";
import {loadControllers} from "@app/utils";
import Config from "@services/config";
import util from "util";

const {version} = require("../package.json");
const baseConfig = require("/etc/autofeed/data/base_configuration.json");

process.env.VERSION = version;

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