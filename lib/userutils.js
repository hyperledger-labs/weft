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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
exports.resolveWalletPath = (walletPath) => {
    let wp = path.resolve(walletPath);
    if (!fs.existsSync(wp)) {
        const homeWalletPath = path.join(os.homedir(), '.ibpwallets', walletPath);
        if (!fs.existsSync(homeWalletPath)) {
            throw new Error(`Can not locate wallet ${wp} or ${homeWalletPath}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3VzZXJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsK0NBQWlDO0FBQ2pDLG9EQUE0QjtBQUVmLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxVQUFrQixFQUFVLEVBQUU7SUFDNUQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUVwQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFFaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLGNBQWMsRUFBRSxDQUFDLENBQUM7U0FDdkU7YUFBTTtZQUNILEVBQUUsR0FBRyxjQUFjLENBQUM7U0FDdkI7S0FDSjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxDQUFDLFdBQW1CLEVBQVUsRUFBRTtJQUM5RCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBRXBCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUV6QixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO2FBQU07WUFDSCxFQUFFLEdBQUcsT0FBTyxDQUFDO1NBQ2hCO0tBQ0o7SUFFRCxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7UUFDL0IsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxDQUFDLElBQVksRUFBVSxFQUFFO0lBQ2pELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFFcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMzQztJQUVELE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRVcsUUFBQSxjQUFjLEdBQUcsQ0FBQyxJQUFZLEVBQVEsRUFBRTtJQUNqRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbkI7QUFDTCxDQUFDLENBQUM7QUFFVyxRQUFBLEtBQUssR0FBRyxDQUFDLElBQVksRUFBUSxFQUFFO0lBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ25CLGdCQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbkI7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZic7XG5cbmV4cG9ydCBjb25zdCByZXNvbHZlV2FsbGV0UGF0aCA9ICh3YWxsZXRQYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGxldCB3cCA9IHBhdGgucmVzb2x2ZSh3YWxsZXRQYXRoKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMod3ApKSB7XG4gICAgICAgIC8vIHNvIGRvZXNuJ3QgZXhpc3Qgc28gdHJ5IHRvIGNoZWNrIGEgZGVmYXVsdCBsb2NhdGlvblxuICAgICAgICBjb25zdCBob21lV2FsbGV0UGF0aCA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcuaWJwd2FsbGV0cycsIHdhbGxldFBhdGgpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoaG9tZVdhbGxldFBhdGgpKSB7XG4gICAgICAgICAgICAvLyBnaXZlIHVwXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbG9jYXRlIHdhbGxldCAke3dwfSBvciAke2hvbWVXYWxsZXRQYXRofWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3AgPSBob21lV2FsbGV0UGF0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gd3A7XG59O1xuXG5leHBvcnQgY29uc3QgcmVzb2x2ZUdhdGV3YXlQYXRoID0gKGdhdGV3YXlQYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGxldCBjcCA9IHBhdGgucmVzb2x2ZShnYXRld2F5UGF0aCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNwKSkge1xuICAgICAgICAvLyBzbyBkb2Vzbid0IGV4aXN0IHNvIHRyeSB0byBjaGVjayBhIGRlZmF1bHQgbG9jYXRpb25cbiAgICAgICAgY29uc3QgZ2F0ZXdheSA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcuaWJwZ2F0ZXdheXMnLCBnYXRld2F5UGF0aCk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhnYXRld2F5KSkge1xuICAgICAgICAgICAgLy8gZ2l2ZSB1cFxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGxvY2F0ZSBnYXRld2F5ICR7Y3B9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjcCA9IGdhdGV3YXk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZnMuc3RhdFN5bmMoY3ApLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgY3AgPSBwYXRoLmpvaW4oY3AsICdnYXRld2F5Lmpzb24nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3A7XG59O1xuXG5leHBvcnQgY29uc3Qgc2FuZVJlYWRGaWxlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgY29uc3Qgd3AgPSBwYXRoLnJlc29sdmUobmFtZSk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHdwKSkge1xuICAgICAgICAvLyBnaXZlIHVwXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBsb2NhdGUgJHt3cH1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHdwLCAndXRmOCcpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUlmQWJzZW50ID0gKG5hbWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHdwID0gcGF0aC5yZXNvbHZlKG5hbWUpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyh3cCkpIHtcbiAgICAgICAgbWtkaXJwLnN5bmMod3ApO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjbGVhbiA9IChuYW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCB3cCA9IHBhdGgucmVzb2x2ZShuYW1lKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyh3cCkpIHtcbiAgICAgICAgcmltcmFmLnN5bmMod3ApO1xuICAgICAgICBta2RpcnAuc3luYyh3cCk7XG4gICAgfVxufTtcbiJdfQ==