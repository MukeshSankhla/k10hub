"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const init_1 = require("./db/init");
const health_1 = __importDefault(require("./api/routes/health"));
const projects_1 = __importDefault(require("./api/routes/projects"));
const categories_1 = __importDefault(require("./api/routes/categories"));
const auth_1 = __importDefault(require("./api/routes/auth"));
const admin_1 = __importDefault(require("./api/routes/admin"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
// Trust reverse proxy if running in production
if (env_1.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
// Security and utility middleware
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({ origin: env_1.corsOrigins, credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, morgan_1.default)('dev'));
// General API Rate Limiting (600 requests per 15 min per IP)
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP. Please try again later.',
    },
});
app.use('/api', globalLimiter);
// Strict Rate Limiting on Authentication Endpoints (60 requests per 15 min per IP)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'AUTH_RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
});
// API Routes
app.use('/api/health', health_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/admin', admin_1.default);
// Static frontend build serving (production / single-server mode)
const frontendDist = path_1.default.resolve(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDist)) {
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('API Error:', err);
    const status = typeof err.status === 'number' ? err.status : 500;
    const isSafeClientError = status < 500;
    const isProd = env_1.env.NODE_ENV === 'production';
    res.status(status).json({
        error: err.code || (status === 429 ? 'TOO_MANY_REQUESTS' : 'INTERNAL_SERVER_ERROR'),
        message: isProd && !isSafeClientError
            ? 'An unexpected internal server error occurred'
            : (err.message || 'An unexpected error occurred'),
    });
});
async function start() {
    try {
        console.log('🔄 Initializing K10 Hub database tables...');
        await (0, init_1.initDatabase)();
        app.listen(env_1.env.PORT, () => {
            console.log(`🚀 K10 Hub API server listening on http://${env_1.env.HOST}:${env_1.env.PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
start();
exports.default = app;
//# sourceMappingURL=server.js.map