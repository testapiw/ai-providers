import dotenv from "dotenv";

dotenv.config();

export default {

    timeout: Number(process.env.AI_TIMEOUT ?? 60000),

    retries: Number(process.env.AI_RETRIES ?? 3),

    retryDelay: Number(process.env.AI_RETRY_DELAY ?? 1000),

    logs: {

        maxSize: 3 * 1024 * 1024,

        revisions: 7

    },

    providers: {

        google: {
            apiKeys: {

                free: process.env.GEMINI_API_KEY_FREE,

                paid: process.env.GEMINI_API_KEY_PAID

            },
            baseUrl: "https://generativelanguage.googleapis.com"
        },

        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY,
            baseUrl: "https://api.anthropic.com"
        },

        deepseek: {
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseUrl: "https://api.deepseek.com/v1"
        }

    }

};