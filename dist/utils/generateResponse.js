"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = void 0;
const generateResponse = (status, data, message) => ({
    status,
    message,
    data,
});
exports.generateResponse = generateResponse;
