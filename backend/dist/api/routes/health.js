"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'K10 Hub API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? 'development',
    });
});
exports.default = router;
//# sourceMappingURL=health.js.map