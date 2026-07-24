const authAttemptModel = require("../models/authAttempt.model");

// In-memory rate limiting map for sliding window check
const ipWindows = new Map();

/**
 * Creates a generic in-memory sliding window rate limiter
 */
const createRateLimiter = (name, getMaxRequests, getWindowMs) => {
    return (req, res, next) => {
        const maxRequests = getMaxRequests();
        const windowMs = getWindowMs();
        const key = `${name}:${req.ip}:${req.user?.id || ""}`;
        const now = Date.now();

        if (!ipWindows.has(key)) {
            ipWindows.set(key, []);
        }

        const timestamps = ipWindows.get(key).filter(t => now - t < windowMs);

        if (timestamps.length >= maxRequests) {
            const resetTime = windowMs - (now - timestamps[0]);
            res.set("Retry-After", Math.ceil(resetTime / 1000));
            return res.status(429).json({
                message: `Too many requests on ${name} endpoints. Please try again in ${Math.ceil(resetTime / 1000)} seconds.`
            });
        }

        timestamps.push(now);
        ipWindows.set(key, timestamps);
        next();
    };
};

// 1. Moderate limits for public endpoints
const publicRateLimiter = createRateLimiter(
    "public",
    () => parseInt(process.env.PUBLIC_MAX_REQUESTS || "60"),
    () => parseInt(process.env.PUBLIC_WINDOW_MS || "60000")
);

// 2. Looser limits for authenticated action endpoints
const authedRateLimiter = createRateLimiter(
    "authenticated",
    () => parseInt(process.env.AUTHED_MAX_REQUESTS || "200"),
    () => parseInt(process.env.AUTHED_WINDOW_MS || "60000")
);

// 3. Strict auth lockout check (Exponential backoff)
async function authLockoutCheck(req, res, next) {
    try {
        const ip = req.ip;
        const account = (req.body.email || req.body.username || "").trim().toLowerCase();

        const maxFailedAttempts = parseInt(process.env.AUTH_MAX_FAILURES || "5");
        const baseLockoutMs = parseInt(process.env.AUTH_BASE_LOCKOUT_MS || "30000"); // 30s base
        const maxLockoutMs = parseInt(process.env.AUTH_MAX_LOCKOUT_MS || "86400000"); // 24h max

        const ipKey = `ip:${ip}`;
        const accountKey = account ? `account:${account}` : null;

        // Query database lockout details
        const ipAttempt = await authAttemptModel.findOne({ key: ipKey });
        const accountAttempt = accountKey ? await authAttemptModel.findOne({ key: accountKey }) : null;

        const now = Date.now();

        // Helper to compute exponential backoff lockout duration
        const checkLockout = (record) => {
            if (!record || record.failures <= maxFailedAttempts) return { locked: false };
            
            // Calculate delay: baseLockoutMs * 2^(failures - maxFailedAttempts)
            const exponent = record.failures - maxFailedAttempts;
            const lockoutDuration = Math.min(baseLockoutMs * Math.pow(2, exponent), maxLockoutMs);
            const timeSinceLast = now - new Date(record.lastAttempt).getTime();

            if (timeSinceLast < lockoutDuration) {
                const secondsLeft = Math.ceil((lockoutDuration - timeSinceLast) / 1000);
                return { locked: true, secondsLeft };
            }
            return { locked: false };
        };

        // Check both IP and Account
        const ipStatus = checkLockout(ipAttempt);
        if (ipStatus.locked) {
            res.set("Retry-After", ipStatus.secondsLeft);
            return res.status(429).json({
                message: `Too many login attempts from this network. Please try again in ${ipStatus.secondsLeft} seconds.`
            });
        }

        if (accountStatus = checkLockout(accountAttempt)) {
            if (accountStatus.locked) {
                res.set("Retry-After", accountStatus.secondsLeft);
                return res.status(429).json({
                    message: `Too many failed logins on this account. Please try again in ${accountStatus.secondsLeft} seconds.`
                });
            }
        }

        next();
    } catch (err) {
        console.error("Lockout middleware error:", err);
        next();
    }
}

// 4. Update helpers triggered in auth controllers
async function recordAuthFailure(ip, account) {
    try {
        const ipKey = `ip:${ip}`;
        const accountKey = account ? `account:${account.trim().toLowerCase()}` : null;

        const updateRecord = async (key) => {
            if (!key) return;
            await authAttemptModel.findOneAndUpdate(
                { key },
                { 
                    $inc: { failures: 1 }, 
                    $set: { lastAttempt: new Date() } 
                },
                { upsert: true, new: true }
            );
        };

        await updateRecord(ipKey);
        await updateRecord(accountKey);
    } catch (err) {
        console.error("Failed to record auth failure in database:", err);
    }
}

async function recordAuthSuccess(ip, account) {
    try {
        const ipKey = `ip:${ip}`;
        const accountKey = account ? `account:${account.trim().toLowerCase()}` : null;

        // Success deletes attempts to clean database and reset counters
        await authAttemptModel.deleteOne({ key: ipKey });
        if (accountKey) {
            await authAttemptModel.deleteOne({ key: accountKey });
        }
    } catch (err) {
        console.error("Failed to reset auth success details in database:", err);
    }
}

module.exports = {
    publicRateLimiter,
    authedRateLimiter,
    authLockoutCheck,
    recordAuthFailure,
    recordAuthSuccess
};
