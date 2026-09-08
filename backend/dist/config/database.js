"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.db = void 0;
const client_1 = require("@libsql/client");
const libsql_1 = require("drizzle-orm/libsql");
const schema = __importStar(require("../db/schema"));
const env_1 = require("./env");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Resolve the database file path
const dbPath = path_1.default.resolve(process.cwd(), env_1.env.DATABASE_URL);
const dbDir = path_1.default.dirname(dbPath);
// Ensure the data directory exists
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
// Create libSQL client (local file-based SQLite)
const client = (0, client_1.createClient)({
    url: `file:${dbPath}`,
});
exports.client = client;
// Initialize Drizzle ORM with our schema
exports.db = (0, libsql_1.drizzle)(client, { schema });
//# sourceMappingURL=database.js.map