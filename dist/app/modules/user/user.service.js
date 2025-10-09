"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
exports.UserService = {
    create(payload) {
        return user_model_1.User.create(payload);
    },
    list() {
        return user_model_1.User.find().select('-password').lean();
    },
    findByEmail(email) {
        return user_model_1.User.findOne({ email }).select('+password');
    },
    findById(id) {
        return user_model_1.User.findById(id).select('-password');
    }
};
