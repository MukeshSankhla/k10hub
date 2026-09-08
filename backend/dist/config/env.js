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
exports.corsOrigins = exports.isProduction = exports.isDevelopment = exports.env = void 0;
const dotenv = __importStar(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load .env from backend root
dotenv.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    HOST: zod_1.z.string().default('localhost'),
    DATABASE_URL: zod_1.z.string().default('./data/k10hub.db'),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:5173,http://localhost:4173'),
    SUPABASE_URL: zod_1.z.string().default(''),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().default(''),
    SUPABASE_ANON_KEY: zod_1.z.string().default(''),
    ADMIN_EMAILS: zod_1.z.string().default('admin@k10hub.io'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
exports.isDevelopment = exports.env.NODE_ENV === 'development';
exports.isProduction = exports.env.NODE_ENV === 'production';
exports.corsOrigins = exports.env.CORS_ORIGINS.split(',').map((o) => o.trim());
//# sourceMappingURL=env.js.map