"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const contact_model_1 = require("./contact.model");
exports.ContactService = {
    create(payload) {
        return contact_model_1.Contact.create(payload);
    },
    list() {
        return contact_model_1.Contact.find().lean();
    },
    findById(id) {
        return contact_model_1.Contact.findById(id).lean();
    }
};
