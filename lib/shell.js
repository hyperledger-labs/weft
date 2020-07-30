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
            console.log(`spawning:: ${_name} in ${cwd}`);
            const call = child_process_1.spawn(this.cmd, this.args, {
                env: process.env,
                shell: true,
                stdio: ['inherit', 'pipe', 'inherit'],
                cwd,
            });
            this.args = [];
            this.stdoutstr = [];
            call.on('exit', (code) => {
                console.log(`spawning:: ${_name} code::${code}`);
                if (code === 0) {
                    resolve(0);
                }
                else {
                    reject(code);
                }
            });
            call.stdout.on('data', (data) => {
                const s = data.toString('utf8');
                console.log(s.slice(0, s.length - 1));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2hlbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBTUEsaURBQXNDO0FBYXRDLE1BQU0sR0FBRztJQUtMLFlBQW1CLENBQVM7UUFKNUIsUUFBRyxHQUFHLEVBQUUsQ0FBQztRQUNULFNBQUksR0FBYSxFQUFFLENBQUM7UUFDcEIsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQUdyQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBR00sS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsS0FBSyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDN0MsTUFBTSxJQUFJLEdBQUcscUJBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztnQkFDaEIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUM7Z0JBQ3JDLEdBQUc7YUFDTixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBRXJCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxLQUFLLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDakQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO29CQUNaLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDZDtxQkFBTTtvQkFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sUUFBUTtRQUNYLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDaEQsQ0FBQztDQUNKO0FBRVksUUFBQSxTQUFTLEdBQUcsQ0FBTyxJQUFjLEVBQXFCLEVBQUU7SUFDakUsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN6QztJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUMsQ0FBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiMgQ29weXJpZ2h0IEh5cGVybGVkZ2VyIEZhYnJpYyBDb250cmlidXRvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4jXG4jIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4qL1xuXG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG4vLyBBIGdlbmVyYWwgcHVycG9zZSBzdHJ1Y3R1cmUgdGhhdCBjYW4gYmUgdXNlZCBmb3IgYW55IGNvbW1hbmQuXG4vLyBUaGlzIGRlZmluZXMgdGhlIGltcG9ydGFudCAnc3Bhd24nIGNvbW1hbmQuIFRoaXMgZXhlY3V0ZXMgdGhlIGNvbW1hbmRcbi8vIHdpdGggdGhlIGFyZ3VtZW50cyB0aGF0IGhhdmUgYmVlbiBzcGVjaWZpZWQuXG4vLyBJdCBpcyBzZXQgdG8gaW5oZXJpdCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLCB1c2VzIHRoZSBkZWZhdWx0IHNlbGwsIGFuZCBpbmhlcml0cyB0aGVcbi8vIHN0ZGlvL3N0ZGVyciBzdHJlYW1zLiAoSW5oZXJpdGluZyBtZWFucyB0aGF0IHRoZSBmb3JtYXRpbmcgY29sb3VyLCBldGMgaXMgbWFpbnRhaW5lZClcbi8vXG4vLyBzcGF3bigpIE1VU1QgYmUgdGhlIGxhc3QgaXRlbSBjaGFpbmVkIHNlcXVlbmNlXG4vL1xuLy8gSXQgYWxzbyBibGFua3MgdGhlIGFyZ3VtZW50cyBzdXBwbGllZCwgc28gdGhlIGluc3RhbmNlIG9mIHRoZSBjbWQgY2FuIGJlIHJldXNlZFxuLy8gSXQgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBleGl0IGNvZGUgaXMgMCwgYW5kIHJlamVjdGVkIGZvciBhbnkgb3RoZXIgY29kZVxuXG5jbGFzcyBDbWQge1xuICAgIGNtZCA9ICcnO1xuICAgIGFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgc3Rkb3V0c3RyOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGM6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNtZCA9IGM7XG4gICAgfVxuXG4gICAgLy8gY2FuIG92ZXJyaWRlIHRoZSBjd2RcbiAgICBwdWJsaWMgc3Bhd24oY3dkID0gcHJvY2Vzcy5jd2QoKSkge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgX25hbWUgPSB0aGlzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS5sb2coYHNwYXduaW5nOjogJHtfbmFtZX0gaW4gJHtjd2R9YCk7XG4gICAgICAgICAgICBjb25zdCBjYWxsID0gc3Bhd24odGhpcy5jbWQsIHRoaXMuYXJncywge1xuICAgICAgICAgICAgICAgIGVudjogcHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgc3RkaW86IFsnaW5oZXJpdCcsICdwaXBlJywgJ2luaGVyaXQnXSxcbiAgICAgICAgICAgICAgICBjd2QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYXJncyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zdGRvdXRzdHIgPSBbXTtcbiAgICAgICAgICAgIGNhbGwub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHNwYXduaW5nOjogJHtfbmFtZX0gY29kZTo6JHtjb2RlfWApO1xuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FsbC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocy5zbGljZSgwLCBzLmxlbmd0aCAtIDEpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZG91dHN0ci5wdXNoKHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmNtZH0gJHt0aGlzLmFyZ3Muam9pbignICcpfWA7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2hlbGxjbWRzID0gYXN5bmMgKGNtZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmdbXT4gPT4ge1xuICAgIGNvbnN0IHJldHZhbHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGMgb2YgY21kcykge1xuICAgICAgICBjb25zdCBjbWQgPSBuZXcgQ21kKGMpO1xuICAgICAgICBhd2FpdCBjbWQuc3Bhd24oKTtcbiAgICAgICAgcmV0dmFscy5wdXNoKGNtZC5zdGRvdXRzdHIuam9pbignICcpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldHZhbHM7XG59O1xuIl19