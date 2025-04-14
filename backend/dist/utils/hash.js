"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparehash = exports.genhash = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const genhash = (str) => {
    const salt = bcryptjs_1.default.genSaltSync(10);
    return bcryptjs_1.default.hashSync(str, salt);
};
exports.genhash = genhash;
const comparehash = (str, hash) => {
    return bcryptjs_1.default.compareSync(str, hash);
};
exports.comparehash = comparehash;
