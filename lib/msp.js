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
        mkdirp.sync(path.join(cryptoroot, 'tls'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXNwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21zcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQSwyQ0FBNkI7QUFDN0IsMkJBQW1DO0FBQ25DLCtDQUFpQztBQUNqQywwRUFBeUM7QUFJekMsTUFBcUIsR0FBRztJQUliLGVBQWUsQ0FBQyxVQUFrQjtRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUN4RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQVNNLE9BQU8sQ0FBQyxPQUFlLEVBQUUsWUFBb0IsRUFBRSxLQUFjO1FBQ2hFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDWixFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNyQjtRQUNELEVBQUUsQ0FBQyxFQUFFLEdBQUcsMkJBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFakMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3BFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEQsa0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEYsa0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkYsa0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLGtCQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RSxDQUFDO0NBQ0o7QUF0Q0Qsc0JBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBzYW5pdGl6ZSBmcm9tICdzYW5pdGl6ZS1maWxlbmFtZSc7XG5cbi8vIGltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTVNQIHtcbiAgICAvKiogY3JlYXRlIHRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGZvciB0aGUgbXNwIGRpcmVjdG9yeVxuICAgICAqXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVN0cnVjdHVyZShjcnlwdG9yb290OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnKSk7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NhY2VydHMnKSk7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJykpO1xuICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdzaWduY2VydHMnKSk7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2FkbWluY2VydHMnKSk7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAndGxzJykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGFuIGluZGl2aWR1YWwgaWQgYmFzZWQgb24gdGhlIGpzb25JZGVudGl0eSBzdXBwbGllZFxuICAgICAqXG4gICAgICogQHBhcmFtIHJvb3RkaXJcbiAgICAgKiBAcGFyYW0ganNvbklkZW50aXR5XG4gICAgICogQHBhcmFtIG1zcGlkXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSWQocm9vdGRpcjogc3RyaW5nLCBqc29uSWRlbnRpdHk6IHN0cmluZywgbXNwaWQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQgPSBKU09OLnBhcnNlKGpzb25JZGVudGl0eSk7XG5cbiAgICAgICAgaWYgKCFpZC5tc3BfaWQpIHtcbiAgICAgICAgICAgIGlkLm1zcF9pZCA9IG1zcGlkO1xuICAgICAgICB9XG4gICAgICAgIGlkLmlkID0gc2FuaXRpemUoaWQubmFtZSk7XG4gICAgICAgIGNvbnN0IGNyeXB0b3Jvb3QgPSBwYXRoLnJlc29sdmUocm9vdGRpciwgaWQuaWQpO1xuICAgICAgICB0aGlzLmNyZWF0ZVN0cnVjdHVyZShjcnlwdG9yb290KTtcblxuICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gQnVmZmVyLmZyb20oaWQucHJpdmF0ZV9rZXksICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBwZW1maWxlID0gQnVmZmVyLmZyb20oaWQuY2VydCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGNhcGVtID0gQnVmZmVyLmZyb20oaWQuY2EsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ3NpZ25jZXJ0cycsIGAke2lkLmlkfS5wZW1gKSwgcGVtZmlsZSk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnYWRtaW5jZXJ0cycsIGAke2lkLmlkfS5wZW1gKSwgcGVtZmlsZSk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAna2V5c3RvcmUnLCBgY2VydF9za2ApLCBwcml2YXRlS2V5KTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdjYWNlcnRzJywgJ2NhLnBlbScpLCBjYXBlbSk7XG4gICAgfVxufVxuIl19