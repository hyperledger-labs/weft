"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableCliLog = exports.enableCliLog = exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
let asCli = false;
exports.log = ({ msg = '>', val = '', error = false }) => {
    if (asCli) {
        if (error) {
            console.log(chalk_1.default.bold.red(msg) + ' ' + val);
        }
        else {
            console.log(chalk_1.default.blue(msg) + ' ' + val);
        }
    }
};
exports.enableCliLog = () => {
    asCli = true;
};
exports.disableCliLog = () => {
    asCli = false;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFJQSxrREFBMEI7QUFFMUIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBRUwsUUFBQSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFtRCxFQUFRLEVBQUU7SUFDakgsSUFBSSxLQUFLLEVBQUU7UUFDUCxJQUFJLEtBQUssRUFBRTtZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ2hEO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQzVDO0tBQ0o7QUFDTCxDQUFDLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxHQUFTLEVBQUU7SUFDbkMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixDQUFDLENBQUM7QUFFVyxRQUFBLGFBQWEsR0FBRyxHQUFTLEVBQUU7SUFDcEMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5sZXQgYXNDbGkgPSBmYWxzZTtcblxuZXhwb3J0IGNvbnN0IGxvZyA9ICh7IG1zZyA9ICc+JywgdmFsID0gJycsIGVycm9yID0gZmFsc2UgfTogeyBtc2c/OiBzdHJpbmc7IHZhbD86IHN0cmluZzsgZXJyb3I/OiBib29sZWFuIH0pOiB2b2lkID0+IHtcbiAgICBpZiAoYXNDbGkpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ib2xkLnJlZChtc2cpICsgJyAnICsgdmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmJsdWUobXNnKSArICcgJyArIHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgZW5hYmxlQ2xpTG9nID0gKCk6IHZvaWQgPT4ge1xuICAgIGFzQ2xpID0gdHJ1ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNhYmxlQ2xpTG9nID0gKCk6IHZvaWQgPT4ge1xuICAgIGFzQ2xpID0gZmFsc2U7XG59O1xuIl19