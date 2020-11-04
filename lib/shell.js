"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shellcmds = void 0;
const child_process_1 = require("child_process");
const log_1 = require("./log");
class Cmd {
    constructor(c) {
        this.cmd = '';
        this.args = [];
        this.stdoutstr = [];
        this.cmd = c;
    }
    spawn(cwd = process.cwd()) {
        const promise = new Promise((resolve, reject) => {
            const _name = this.toString();
            log_1.log({ msg: `spawning:: ${_name} in ${cwd}` });
            const call = child_process_1.spawn(this.cmd, this.args, {
                env: process.env,
                shell: true,
                stdio: ['inherit', 'pipe', 'inherit'],
                cwd,
            });
            this.args = [];
            this.stdoutstr = [];
            call.on('exit', (code) => {
                log_1.log({ msg: `exit:: ${_name} code::${code}`, error: code !== 0 });
                if (code === 0) {
                    resolve(0);
                }
                else {
                    reject(code);
                }
            });
            call.stdout.on('data', (data) => {
                const s = data.toString('utf8');
                log_1.log({ msg: s.slice(0, s.length - 1) });
                this.stdoutstr.push(s);
            });
            return call;
        });
        return promise;
    }
    toString() {
        return `${this.cmd} ${this.args.join(' ')}`;
    }
}
exports.shellcmds = (cmds) => __awaiter(void 0, void 0, void 0, function* () {
    const retvals = [];
    for (const c of cmds) {
        const cmd = new Cmd(c);
        yield cmd.spawn();
        retvals.push(cmd.stdoutstr.join(' '));
    }
    return retvals;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2hlbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBTUEsaURBQXNDO0FBQ3RDLCtCQUE0QjtBQWE1QixNQUFNLEdBQUc7SUFLTCxZQUFtQixDQUFTO1FBSjVCLFFBQUcsR0FBRyxFQUFFLENBQUM7UUFDVCxTQUFJLEdBQWEsRUFBRSxDQUFDO1FBQ3BCLGNBQVMsR0FBYSxFQUFFLENBQUM7UUFHckIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztJQUdNLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFOUIsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLGNBQWMsS0FBSyxPQUFPLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5QyxNQUFNLElBQUksR0FBRyxxQkFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDcEMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO2dCQUNoQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQztnQkFDckMsR0FBRzthQUNOLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFFckIsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsS0FBSyxVQUFVLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakUsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO29CQUNaLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDZDtxQkFBTTtvQkFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ2hELENBQUM7Q0FDSjtBQUVZLFFBQUEsU0FBUyxHQUFHLENBQU8sSUFBYyxFQUFxQixFQUFFO0lBQ2pFLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtRQUNsQixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDekM7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDLENBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4jIENvcHlyaWdodCBIeXBlcmxlZGdlciBGYWJyaWMgQ29udHJpYnV0b3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuI1xuIyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuKi9cblxuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcblxuLy8gQSBnZW5lcmFsIHB1cnBvc2Ugc3RydWN0dXJlIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGFueSBjb21tYW5kLlxuLy8gVGhpcyBkZWZpbmVzIHRoZSBpbXBvcnRhbnQgJ3NwYXduJyBjb21tYW5kLiBUaGlzIGV4ZWN1dGVzIHRoZSBjb21tYW5kXG4vLyB3aXRoIHRoZSBhcmd1bWVudHMgdGhhdCBoYXZlIGJlZW4gc3BlY2lmaWVkLlxuLy8gSXQgaXMgc2V0IHRvIGluaGVyaXQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcywgdXNlcyB0aGUgZGVmYXVsdCBzZWxsLCBhbmQgaW5oZXJpdHMgdGhlXG4vLyBzdGRpby9zdGRlcnIgc3RyZWFtcy4gKEluaGVyaXRpbmcgbWVhbnMgdGhhdCB0aGUgZm9ybWF0aW5nIGNvbG91ciwgZXRjIGlzIG1haW50YWluZWQpXG4vL1xuLy8gc3Bhd24oKSBNVVNUIGJlIHRoZSBsYXN0IGl0ZW0gY2hhaW5lZCBzZXF1ZW5jZVxuLy9cbi8vIEl0IGFsc28gYmxhbmtzIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQsIHNvIHRoZSBpbnN0YW5jZSBvZiB0aGUgY21kIGNhbiBiZSByZXVzZWRcbi8vIEl0IHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgZXhpdCBjb2RlIGlzIDAsIGFuZCByZWplY3RlZCBmb3IgYW55IG90aGVyIGNvZGVcblxuY2xhc3MgQ21kIHtcbiAgICBjbWQgPSAnJztcbiAgICBhcmdzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHN0ZG91dHN0cjogc3RyaW5nW10gPSBbXTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihjOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jbWQgPSBjO1xuICAgIH1cblxuICAgIC8vIGNhbiBvdmVycmlkZSB0aGUgY3dkXG4gICAgcHVibGljIHNwYXduKGN3ZCA9IHByb2Nlc3MuY3dkKCkpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IF9uYW1lID0gdGhpcy50b1N0cmluZygpO1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIGxvZyh7IG1zZzogYHNwYXduaW5nOjogJHtfbmFtZX0gaW4gJHtjd2R9YCB9KTtcbiAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBzcGF3bih0aGlzLmNtZCwgdGhpcy5hcmdzLCB7XG4gICAgICAgICAgICAgICAgZW52OiBwcm9jZXNzLmVudixcbiAgICAgICAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzdGRpbzogWydpbmhlcml0JywgJ3BpcGUnLCAnaW5oZXJpdCddLFxuICAgICAgICAgICAgICAgIGN3ZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hcmdzID0gW107XG4gICAgICAgICAgICB0aGlzLnN0ZG91dHN0ciA9IFtdO1xuICAgICAgICAgICAgY2FsbC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICBsb2coeyBtc2c6IGBleGl0OjogJHtfbmFtZX0gY29kZTo6JHtjb2RlfWAsIGVycm9yOiBjb2RlICE9PSAwIH0pO1xuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FsbC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgbG9nKHsgbXNnOiBzLnNsaWNlKDAsIHMubGVuZ3RoIC0gMSkgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGRvdXRzdHIucHVzaChzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNhbGw7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5jbWR9ICR7dGhpcy5hcmdzLmpvaW4oJyAnKX1gO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNoZWxsY21kcyA9IGFzeW5jIChjbWRzOiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCByZXR2YWxzID0gW107XG4gICAgZm9yIChjb25zdCBjIG9mIGNtZHMpIHtcbiAgICAgICAgY29uc3QgY21kID0gbmV3IENtZChjKTtcbiAgICAgICAgYXdhaXQgY21kLnNwYXduKCk7XG4gICAgICAgIHJldHZhbHMucHVzaChjbWQuc3Rkb3V0c3RyLmpvaW4oJyAnKSk7XG4gICAgfVxuICAgIHJldHVybiByZXR2YWxzO1xufTtcbiJdfQ==