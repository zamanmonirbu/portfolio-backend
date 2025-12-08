"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_model_1 = require("./project.model");
exports.ProjectService = {
    create(payload) {
        return project_model_1.Project.create(payload);
    },
    list() {
        return project_model_1.Project.find().sort({ createdAt: -1 }).limit(5).lean();
    },
    findById(id) {
        return project_model_1.Project.findById(id).lean();
    },
    // ✅ FIXED update
    update(id, payload) {
        return project_model_1.Project.findByIdAndUpdate(id, payload, { new: true }).lean();
    },
    // ✅ FIXED delete
    async delete(id) {
        const result = await project_model_1.Project.findByIdAndDelete(id).lean();
        return result !== null;
    },
};
