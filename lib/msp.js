"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs_1 = require("fs");
const mkdirp = __importStar(require("mkdirp"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
class MSP {
    createStructure(cryptoroot) {
        mkdirp.sync(path.join(cryptoroot, 'msp'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'cacerts'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'keystore'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'signcerts'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'admincerts'));
    }
    writeId(rootdir, jsonIdentity, mspid) {
        const id = JSON.parse(jsonIdentity);
        if (!id.msp_id) {
            id.msp_id = mspid;
        }
        id.id = sanitize_filename_1.default(id.name);
        const cryptoroot = path.resolve(rootdir, id.id);
        this.createStructure(cryptoroot);
        const privateKey = Buffer.from(id.private_key, 'base64').toString();
        const pemfile = Buffer.from(id.cert, 'base64').toString();
        const capem = Buffer.from(id.ca, 'base64').toString();
        fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
        fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'admincerts', `${id.id}.pem`), pemfile);
        fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);
        fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem'), capem);
    }
}
exports.default = MSP;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXNwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21zcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQSwyQ0FBNkI7QUFDN0IsMkJBQW1DO0FBQ25DLCtDQUFpQztBQUNqQywwRUFBeUM7QUFJekMsTUFBcUIsR0FBRztJQUNiLGVBQWUsQ0FBQyxVQUFrQjtRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQWUsRUFBRSxZQUFvQixFQUFFLEtBQWM7UUFDaEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRTtZQUNaLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ3JCO1FBQ0QsRUFBRSxDQUFDLEVBQUUsR0FBRywyQkFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVqQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0RCxrQkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRixrQkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRixrQkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0Usa0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQTNCRCxzQkEyQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IHNhbml0aXplIGZyb20gJ3Nhbml0aXplLWZpbGVuYW1lJztcblxuLy8gaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi9sb2cnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNU1Age1xuICAgIHB1YmxpYyBjcmVhdGVTdHJ1Y3R1cmUoY3J5cHRvcm9vdDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJykpO1xuICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdjYWNlcnRzJykpO1xuICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdrZXlzdG9yZScpKTtcbiAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnc2lnbmNlcnRzJykpO1xuICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdhZG1pbmNlcnRzJykpO1xuICAgIH1cblxuICAgIHB1YmxpYyB3cml0ZUlkKHJvb3RkaXI6IHN0cmluZywganNvbklkZW50aXR5OiBzdHJpbmcsIG1zcGlkPzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkID0gSlNPTi5wYXJzZShqc29uSWRlbnRpdHkpO1xuXG4gICAgICAgIGlmICghaWQubXNwX2lkKSB7XG4gICAgICAgICAgICBpZC5tc3BfaWQgPSBtc3BpZDtcbiAgICAgICAgfVxuICAgICAgICBpZC5pZCA9IHNhbml0aXplKGlkLm5hbWUpO1xuICAgICAgICBjb25zdCBjcnlwdG9yb290ID0gcGF0aC5yZXNvbHZlKHJvb3RkaXIsIGlkLmlkKTtcbiAgICAgICAgdGhpcy5jcmVhdGVTdHJ1Y3R1cmUoY3J5cHRvcm9vdCk7XG5cbiAgICAgICAgY29uc3QgcHJpdmF0ZUtleSA9IEJ1ZmZlci5mcm9tKGlkLnByaXZhdGVfa2V5LCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgcGVtZmlsZSA9IEJ1ZmZlci5mcm9tKGlkLmNlcnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBjYXBlbSA9IEJ1ZmZlci5mcm9tKGlkLmNhLCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdzaWduY2VydHMnLCBgJHtpZC5pZH0ucGVtYCksIHBlbWZpbGUpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2FkbWluY2VydHMnLCBgJHtpZC5pZH0ucGVtYCksIHBlbWZpbGUpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJywgYGNlcnRfc2tgKSwgcHJpdmF0ZUtleSk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnY2FjZXJ0cycsICdjYS5wZW0nKSwgY2FwZW0pO1xuICAgIH1cbn1cbiJdfQ==