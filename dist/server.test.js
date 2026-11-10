import assert from "node:assert/strict";
import test from "node:test";
import { app } from "./server.js";
test("CORS headers are present on preflight and unauthorized responses", async (t) => {
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    t.after(async () => {
        await new Promise((resolve) => server.close(() => resolve()));
    });
    const preflight = await fetch(`${baseUrl}/notes`, {
        method: "OPTIONS",
        headers: {
            Origin: "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "http://localhost:3000");
    assert.equal(preflight.headers.get("access-control-allow-credentials"), "true");
    const unauthorized = await fetch(`${baseUrl}/me`, {
        headers: { Origin: "http://localhost:5173" },
    });
    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorized.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(unauthorized.headers.get("access-control-allow-credentials"), "true");
    const trailingSlash = await fetch(`${baseUrl}/health/`, {
        headers: { Origin: "http://localhost:3000" },
    });
    assert.equal(trailingSlash.status, 200);
});
//# sourceMappingURL=server.test.js.map