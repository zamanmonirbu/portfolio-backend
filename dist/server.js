"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./core/db");
const env_1 = __importDefault(require("./core/env"));
const server = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.default.port, () => {
        console.log(`Server: http://localhost:${env_1.default.port}`);
    });
};
server();
