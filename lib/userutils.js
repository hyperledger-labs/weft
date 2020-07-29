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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saneReadFile = exports.resolveGatewayPath = exports.resolveWalletPath = void 0;
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3VzZXJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFaEIsUUFBQSxpQkFBaUIsR0FBRyxDQUFDLFVBQWtCLEVBQVUsRUFBRTtJQUM1RCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBRXBCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUVoQyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixFQUFFLE9BQU8sY0FBYyxFQUFFLENBQUMsQ0FBQztTQUN2RTthQUFNO1lBQ0gsRUFBRSxHQUFHLGNBQWMsQ0FBQztTQUN2QjtLQUNKO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFVyxRQUFBLGtCQUFrQixHQUFHLENBQUMsV0FBbUIsRUFBVSxFQUFFO0lBQzlELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFFcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBRXpCLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDbkQ7YUFBTTtZQUNILEVBQUUsR0FBRyxPQUFPLENBQUM7U0FDaEI7S0FDSjtJQUVELElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUMvQixFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDdEM7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVXLFFBQUEsWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFVLEVBQUU7SUFDakQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUVwQixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY29uc3QgcmVzb2x2ZVdhbGxldFBhdGggPSAod2FsbGV0UGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBsZXQgd3AgPSBwYXRoLnJlc29sdmUod2FsbGV0UGF0aCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHdwKSkge1xuICAgICAgICAvLyBzbyBkb2Vzbid0IGV4aXN0IHNvIHRyeSB0byBjaGVjayBhIGRlZmF1bHQgbG9jYXRpb25cbiAgICAgICAgY29uc3QgaG9tZVdhbGxldFBhdGggPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmlicHdhbGxldHMnLCB3YWxsZXRQYXRoKTtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGhvbWVXYWxsZXRQYXRoKSkge1xuICAgICAgICAgICAgLy8gZ2l2ZSB1cFxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGxvY2F0ZSB3YWxsZXQgJHt3cH0gb3IgJHtob21lV2FsbGV0UGF0aH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdwID0gaG9tZVdhbGxldFBhdGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHdwO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlc29sdmVHYXRld2F5UGF0aCA9IChnYXRld2F5UGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBsZXQgY3AgPSBwYXRoLnJlc29sdmUoZ2F0ZXdheVBhdGgpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhjcCkpIHtcbiAgICAgICAgLy8gc28gZG9lc24ndCBleGlzdCBzbyB0cnkgdG8gY2hlY2sgYSBkZWZhdWx0IGxvY2F0aW9uXG4gICAgICAgIGNvbnN0IGdhdGV3YXkgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmlicGdhdGV3YXlzJywgZ2F0ZXdheVBhdGgpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZ2F0ZXdheSkpIHtcbiAgICAgICAgICAgIC8vIGdpdmUgdXBcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBsb2NhdGUgZ2F0ZXdheSAke2NwfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3AgPSBnYXRld2F5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZzLnN0YXRTeW5jKGNwKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIGNwID0gcGF0aC5qb2luKGNwLCAnZ2F0ZXdheS5qc29uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNwO1xufTtcblxuZXhwb3J0IGNvbnN0IHNhbmVSZWFkRmlsZSA9IChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IHdwID0gcGF0aC5yZXNvbHZlKG5hbWUpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyh3cCkpIHtcbiAgICAgICAgLy8gZ2l2ZSB1cFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbG9jYXRlICR7d3B9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyh3cCwgJ3V0ZjgnKTtcbn07XG4iXX0=