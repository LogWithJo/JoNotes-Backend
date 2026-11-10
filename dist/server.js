import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors, {} from 'cors';
import 'dotenv/config';
import express, {} from 'express';
import { runtimeConfig } from './config/runtime.js';
import { getMe, refresh, revokeToken } from './controller/auth.controller.js';
import { requireAuth } from './middleware/requireAuth.js';
import authRoutes from './routes/auth.routes.js';
import notesRoutes from './routes/notes.routes.js';
const app = express();
app.set('trust proxy', 1);
app.set('strict routing', false);
const corsOptions = {
    origin: (origin, callback) => {
        // Requests from server-side tools do not have an Origin header.
        if (!origin || runtimeConfig.allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // Let the explicit global OPTIONS handler below finish preflight requests.
    preflightContinue: true,
};
// Keep CORS before parsers and every application route so 401s and errors
// emitted by later middleware retain the appropriate response headers.
app.use(cors(corsOptions));
// Express 5 no longer accepts the legacy "*" path pattern here. A RegExp
// matches every path, including '/', and provides the same global handling.
app.options(/.*/, cors({
    ...corsOptions,
    preflightContinue: false,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
// Top-level aliases for /me, /refresh-token, and /revoke-token
app.get('/me', requireAuth, getMe);
app.post('/refresh-token', refresh);
app.post('/revoke-token', revokeToken);
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'Server is alive!' });
});
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, environment: runtimeConfig.nodeEnv });
});
// CORS has already run by this point, so API errors (including unhandled
// exceptions) return the same CORS headers as successful responses.
app.use((error, _req, res, _next) => {
    console.error(error);
    if (res.headersSent) {
        return;
    }
    res.status(500).json({ error: 'Internal server error' });
});
export function startServer() {
    return app.listen(runtimeConfig.port, '0.0.0.0', () => {
        console.log(`Server running on port ${runtimeConfig.port}`);
    });
}
export { app };
const isDirectRun = process.argv[1] !== undefined &&
    fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
    startServer();
}
export default app;
//# sourceMappingURL=server.js.map