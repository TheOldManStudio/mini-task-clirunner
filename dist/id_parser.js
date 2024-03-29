"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIds = void 0;
const lodash_1 = __importDefault(require("lodash"));
const parseIds = (input) => {
    let ids = [];
    if (input) {
        const tokens = input.toString().split(",");
        // console.log(tokens);
        tokens.forEach((element) => {
            if (element && element.trim() !== "") {
                if (element.indexOf("-") !== -1) {
                    ids = ids.concat(parseRange(element));
                }
                else {
                    const id = parseInt(element);
                    if (!isNaN(id)) {
                        ids.push(id);
                    }
                }
            }
        });
    }
    return lodash_1.default.uniq(ids).map((i) => i.toString());
};
exports.parseIds = parseIds;
const parseRange = (rangeToken) => {
    const tokens = rangeToken.split("-");
    if (tokens.length !== 2)
        throw new Error(`arg error: ${rangeToken}`);
    let ranges = tokens.map((t) => parseInt(t));
    // console.log(tokens);
    if (isNaN(ranges[0]) || isNaN(ranges[1]))
        throw new Error(`arg error: ${rangeToken}`);
    ranges = lodash_1.default.sortBy(ranges);
    const ids = [];
    for (let i = ranges[0]; i <= ranges[1]; i++) {
        ids.push(i);
    }
    return ids;
};
