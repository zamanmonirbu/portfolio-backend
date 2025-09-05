"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./core/env");
const db_1 = require("./core/db");
const server = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.env.PORT, () => {
        console.log(`Server: http://localhost:${env_1.env.PORT}`);
    });
};
server();
