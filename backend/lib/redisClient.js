import dotenv from "dotenv";
import path from "path";
import { createClient } from "redis";

const logPrefix = "[Redis]";

dotenv.config({ path: path.resolve("./backend/.env") });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
        console.log(`${logPrefix} Cache disabled. Set REDIS_URL to enable Redis caching.`);
}

let client = redisUrl ? createClient({ url: redisUrl }) : null;

if (client) {
        client.on("ready", () => {
                console.log(`${logPrefix} Connected to cache.`);
        });

        client.on("end", () => {
                console.log(`${logPrefix} Connection closed.`);
        });

        client.on("reconnecting", () => {
                console.log(`${logPrefix} Attempting to reconnect...`);
        });

        client.on("error", (error) => {
                console.error(`${logPrefix} Client error: ${error.message}`);
        });

        client
                .connect()
                .catch((error) => {
                        console.error(`${logPrefix} Initial connection failed: ${error.message}`);
                });
}

const ensureClient = () => {
        if (!client || !client.isReady) {
                throw new Error("Redis client is not ready");
        }

        return client;
};

export const redisClient = {
        isEnabled: () => Boolean(redisUrl),
        isReady: () => Boolean(client?.isReady),
        async get(key) {
                try {
                        const activeClient = ensureClient();
                        return await activeClient.get(key);
                } catch (error) {
                        console.error(`${logPrefix} GET ${key} failed: ${error.message}`);
                        throw error;
                }
        },
        async setEx(key, ttlInSeconds, value) {
                try {
                        const activeClient = ensureClient();
                        return await activeClient.setEx(key, ttlInSeconds, value);
                } catch (error) {
                        console.error(`${logPrefix} SETEX ${key} failed: ${error.message}`);
                        throw error;
                }
        },
        async del(key) {
                try {
                        const activeClient = ensureClient();
                        return await activeClient.del(key);
                } catch (error) {
                        console.error(`${logPrefix} DEL ${key} failed: ${error.message}`);
                        throw error;
                }
        },
};

export default redisClient;
