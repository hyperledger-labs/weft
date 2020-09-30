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
exports.clean = exports.createIfAbsent = exports.saneReadFile = exports.resolveGatewayPath = exports.resolveWalletPath = void 0;
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mkdirp = __importStar(require("mkdirp"));
const rimraf_1 = __importDefault(require("rimraf"));
exports.resolveWalletPath = (walletPath, create) => {
    let wp = path.resolve(walletPath);
    if (!fs.existsSync(wp)) {
        const homeWalletPath = path.join(os.homedir(), '.ibpwallets', walletPath);
        if (!fs.existsSync(homeWalletPath)) {
            if (create) {
                mkdirp.sync(homeWalletPath);
            }
            else {
                throw new Error(`Can not locate wallet ${wp} or ${homeWalletPath}`);
            }
        }
        else {
            wp = homeWalletPath;
        }
    }
    return wp;
};
exports.resolveGatewayPath = (gatewayPath) => {
    let cp = path.resolve(gatewayPath);
    if (!fs.existsSync(cp)) {
        const gateway = path.join(os.homedir(), '.ibpgateways', gatewayPath);
        if (!fs.existsSync(gateway)) {
            throw new Error(`Can not locate gateway ${cp}`);
        }
        else {
            cp = gateway;
        }
    }
    if (fs.statSync(cp).isDirectory()) {
        cp = path.join(cp, 'gateway.json');
    }
    return cp;
};
exports.saneReadFile = (name) => {
    const wp = path.resolve(name);
    if (!fs.existsSync(wp)) {
        throw new Error(`Can not locate ${wp}`);
    }
    return fs.readFileSync(wp, 'utf8');
};
exports.createIfAbsent = (name) => {
    const wp = path.resolve(name);
    if (!fs.existsSync(wp)) {
        mkdirp.sync(wp);
    }
};
exports.clean = (name) => {
    const wp = path.resolve(name);
    if (fs.existsSync(wp)) {
        rimraf_1.default.sync(wp);
        mkdirp.sync(wp);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3VzZXJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsK0NBQWlDO0FBQ2pDLG9EQUE0QjtBQUVmLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxVQUFrQixFQUFFLE1BQWdCLEVBQVUsRUFBRTtJQUM5RSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBRXBCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUNoQyxJQUFJLE1BQU0sRUFBRTtnQkFDUixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQy9CO2lCQUFNO2dCQUVILE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEVBQUUsT0FBTyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZFO1NBQ0o7YUFBTTtZQUNILEVBQUUsR0FBRyxjQUFjLENBQUM7U0FDdkI7S0FDSjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxDQUFDLFdBQW1CLEVBQVUsRUFBRTtJQUM5RCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBRXBCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUV6QixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO2FBQU07WUFDSCxFQUFFLEdBQUcsT0FBTyxDQUFDO1NBQ2hCO0tBQ0o7SUFFRCxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7UUFDL0IsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxDQUFDLElBQVksRUFBVSxFQUFFO0lBQ2pELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFFcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMzQztJQUVELE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRVcsUUFBQSxjQUFjLEdBQUcsQ0FBQyxJQUFZLEVBQVEsRUFBRTtJQUNqRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbkI7QUFDTCxDQUFDLENBQUM7QUFFVyxRQUFBLEtBQUssR0FBRyxDQUFDLElBQVksRUFBUSxFQUFFO0lBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ25CLGdCQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbkI7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZic7XG5cbmV4cG9ydCBjb25zdCByZXNvbHZlV2FsbGV0UGF0aCA9ICh3YWxsZXRQYXRoOiBzdHJpbmcsIGNyZWF0ZT86IGJvb2xlYW4pOiBzdHJpbmcgPT4ge1xuICAgIGxldCB3cCA9IHBhdGgucmVzb2x2ZSh3YWxsZXRQYXRoKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMod3ApKSB7XG4gICAgICAgIC8vIHNvIGRvZXNuJ3QgZXhpc3Qgc28gdHJ5IHRvIGNoZWNrIGEgZGVmYXVsdCBsb2NhdGlvblxuICAgICAgICBjb25zdCBob21lV2FsbGV0UGF0aCA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcuaWJwd2FsbGV0cycsIHdhbGxldFBhdGgpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoaG9tZVdhbGxldFBhdGgpKSB7XG4gICAgICAgICAgICBpZiAoY3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMoaG9tZVdhbGxldFBhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBnaXZlIHVwXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGxvY2F0ZSB3YWxsZXQgJHt3cH0gb3IgJHtob21lV2FsbGV0UGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdwID0gaG9tZVdhbGxldFBhdGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHdwO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlc29sdmVHYXRld2F5UGF0aCA9IChnYXRld2F5UGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBsZXQgY3AgPSBwYXRoLnJlc29sdmUoZ2F0ZXdheVBhdGgpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhjcCkpIHtcbiAgICAgICAgLy8gc28gZG9lc24ndCBleGlzdCBzbyB0cnkgdG8gY2hlY2sgYSBkZWZhdWx0IGxvY2F0aW9uXG4gICAgICAgIGNvbnN0IGdhdGV3YXkgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmlicGdhdGV3YXlzJywgZ2F0ZXdheVBhdGgpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZ2F0ZXdheSkpIHtcbiAgICAgICAgICAgIC8vIGdpdmUgdXBcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBsb2NhdGUgZ2F0ZXdheSAke2NwfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3AgPSBnYXRld2F5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZzLnN0YXRTeW5jKGNwKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIGNwID0gcGF0aC5qb2luKGNwLCAnZ2F0ZXdheS5qc29uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNwO1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbmVSZWFkRmlsZSA9IChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IHdwID0gcGF0aC5yZXNvbHZlKG5hbWUpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyh3cCkpIHtcbiAgICAgICAgLy8gZ2l2ZSB1cFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbG9jYXRlICR7d3B9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyh3cCwgJ3V0ZjgnKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVJZkFic2VudCA9IChuYW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCB3cCA9IHBhdGgucmVzb2x2ZShuYW1lKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMod3ApKSB7XG4gICAgICAgIG1rZGlycC5zeW5jKHdwKTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xlYW4gPSAobmFtZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgd3AgPSBwYXRoLnJlc29sdmUobmFtZSk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMod3ApKSB7XG4gICAgICAgIHJpbXJhZi5zeW5jKHdwKTtcbiAgICAgICAgbWtkaXJwLnN5bmMod3ApO1xuICAgIH1cbn07XG4iXX0=