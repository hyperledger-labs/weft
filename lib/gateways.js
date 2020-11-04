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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGatewayProfile = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const JSON_EXT = /json/gi;
const YAML_EXT = /ya?ml/gi;
exports.getGatewayProfile = (profilename) => {
    const ccpPath = path.resolve(profilename);
    if (!fs.existsSync(ccpPath)) {
        throw new Error(`Gateway ${ccpPath} does not exist`);
    }
    const type = path.extname(ccpPath);
    if (JSON_EXT.exec(type)) {
        return JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    }
    else if (YAML_EXT.exec(type)) {
        return yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));
    }
    else {
        throw new Error(`Extension of ${ccpPath} not recognised`);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0ZXdheXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2F0ZXdheXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFDekIsOENBQWdDO0FBRWhDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUMxQixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFXZCxRQUFBLGlCQUFpQixHQUFHLENBQUMsV0FBbUIsRUFBTyxFQUFFO0lBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLE9BQU8saUJBQWlCLENBQUMsQ0FBQztLQUN4RDtJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ3ZEO1NBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzVCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzFEO1NBQU07UUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixPQUFPLGlCQUFpQixDQUFDLENBQUM7S0FDN0Q7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHlhbWwgZnJvbSAnanMteWFtbCc7XG5cbmNvbnN0IEpTT05fRVhUID0gL2pzb24vZ2k7XG5jb25zdCBZQU1MX0VYVCA9IC95YT9tbC9naTtcblxuLyoqXG4gKiBMb2FkcyB0aGUgcHJvZmlsZSBhdCB0aGUgZ2l2ZW4gZmlsZW5hbWUuXG4gKlxuICogRmlsZSBjYW4gZWl0aGVyIGJ5IHlhbWwgb3IganNvbiwgZXJyb3IgaXMgdGhyb3duIGlzIHRoZSBmaWxlIGRvZXNcbiAqIG5vdCBleGlzdCBhdCB0aGUgbG9jYXRpb24gZ2l2ZW4uXG4gKlxuICogQHBhcmFtIHByb2ZpbGVuYW1lIGZpbGVuYW1lIG9mIHRoZSBnYXRld2F5IGNvbm5lY3Rpb24gcHJvZmlsZVxuICogQHJldHVybiBHYXRld2F5IHByb2ZpbGUgYXMgYW4gb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRHYXRld2F5UHJvZmlsZSA9IChwcm9maWxlbmFtZTogc3RyaW5nKTogYW55ID0+IHtcbiAgICBjb25zdCBjY3BQYXRoID0gcGF0aC5yZXNvbHZlKHByb2ZpbGVuYW1lKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY2NwUGF0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHYXRld2F5ICR7Y2NwUGF0aH0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlID0gcGF0aC5leHRuYW1lKGNjcFBhdGgpO1xuXG4gICAgaWYgKEpTT05fRVhULmV4ZWModHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNjcFBhdGgsICd1dGY4JykpO1xuICAgIH0gZWxzZSBpZiAoWUFNTF9FWFQuZXhlYyh0eXBlKSkge1xuICAgICAgICByZXR1cm4geWFtbC5zYWZlTG9hZChmcy5yZWFkRmlsZVN5bmMoY2NwUGF0aCwgJ3V0ZjgnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHRlbnNpb24gb2YgJHtjY3BQYXRofSBub3QgcmVjb2duaXNlZGApO1xuICAgIH1cbn07XG4iXX0=