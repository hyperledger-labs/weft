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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0ZXdheXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2F0ZXdheXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFDekIsOENBQWdDO0FBRWhDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUMxQixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFFZCxRQUFBLGlCQUFpQixHQUFHLENBQUMsV0FBbUIsRUFBTyxFQUFFO0lBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLE9BQU8saUJBQWlCLENBQUMsQ0FBQztLQUN4RDtJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ3ZEO1NBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzVCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzFEO1NBQU07UUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixPQUFPLGlCQUFpQixDQUFDLENBQUM7S0FDN0Q7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHlhbWwgZnJvbSAnanMteWFtbCc7XG5cbmNvbnN0IEpTT05fRVhUID0gL2pzb24vZ2k7XG5jb25zdCBZQU1MX0VYVCA9IC95YT9tbC9naTtcblxuZXhwb3J0IGNvbnN0IGdldEdhdGV3YXlQcm9maWxlID0gKHByb2ZpbGVuYW1lOiBzdHJpbmcpOiBhbnkgPT4ge1xuICAgIGNvbnN0IGNjcFBhdGggPSBwYXRoLnJlc29sdmUocHJvZmlsZW5hbWUpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhjY3BQYXRoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEdhdGV3YXkgJHtjY3BQYXRofSBkb2VzIG5vdCBleGlzdGApO1xuICAgIH1cblxuICAgIGNvbnN0IHR5cGUgPSBwYXRoLmV4dG5hbWUoY2NwUGF0aCk7XG5cbiAgICBpZiAoSlNPTl9FWFQuZXhlYyh0eXBlKSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY2NwUGF0aCwgJ3V0ZjgnKSk7XG4gICAgfSBlbHNlIGlmIChZQU1MX0VYVC5leGVjKHR5cGUpKSB7XG4gICAgICAgIHJldHVybiB5YW1sLnNhZmVMb2FkKGZzLnJlYWRGaWxlU3luYyhjY3BQYXRoLCAndXRmOCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4dGVuc2lvbiBvZiAke2NjcFBhdGh9IG5vdCByZWNvZ25pc2VkYCk7XG4gICAgfVxufTtcbiJdfQ==