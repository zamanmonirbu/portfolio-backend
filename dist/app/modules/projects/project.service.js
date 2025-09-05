"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_model_1 = require("./project.model");
exports.ProjectService = {
    create(payload) {
        return project_model_1.Project.create(payload);
    },
    list() {
        return project_model_1.Project.find().lean();
    },
    findById(id) {
        return project_model_1.Project.findById(id).lean();
    }
};
