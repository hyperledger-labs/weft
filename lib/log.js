"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.log = ({ msg = '>', val = '', error = false }) => {
    if (error) {
        console.log(chalk_1.default.red(msg) + ' ' + val);
    }
    else {
        console.log(chalk_1.default.white(msg) + ' ' + val);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFJQSxrREFBMEI7QUFFYixRQUFBLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxLQUFLLEVBQW1ELEVBQVEsRUFBRTtJQUNqSCxJQUFJLEtBQUssRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDM0M7U0FBTTtRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDN0M7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5leHBvcnQgY29uc3QgbG9nID0gKHsgbXNnID0gJz4nLCB2YWwgPSAnJywgZXJyb3IgPSBmYWxzZSB9OiB7IG1zZz86IHN0cmluZzsgdmFsPzogc3RyaW5nOyBlcnJvcj86IGJvb2xlYW4gfSk6IHZvaWQgPT4ge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQobXNnKSArICcgJyArIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUobXNnKSArICcgJyArIHZhbCk7XG4gICAgfVxufTtcbiJdfQ==