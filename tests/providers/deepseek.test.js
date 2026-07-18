import "dotenv/config";
import AIClient from "../../src/index.js";
import models from "../../config/models.json" with { type: "json" };

const config = {

    models,

    http: {

        timeout: 60000,

        retries: 3,

        retryDelay: 1000

    },

    telemetry: {

        enabled: true,

        directory: "./logs",

        maxFileSize: 3 * 1024 * 1024,

        revisions: 7

    }

};

async function main() {

    const ai = new AIClient(config);

    // deepseek-v4-flash | deepseek-v4-pro | deepseek-chat & deepseek-reasoner
    const model = "deepseek-v4-flash"

    try {

        const response = await ai.generate({

            model: "deepseek-v4-flash",

            system: "Ти досвічений JavaScript розробник.",

            prompt: "Що таке Event Loop? Відповідь в трьох реченях."

        });
            
        console.log();
        console.log("===== AI RESPONSE =====");
        console.log();
        console.log(response.text);
        console.log();

        console.table({
            Provider: response.provider,
            Model: response.model,
            Duration: `${response.duration} ms`,
            PromptTokens: response.usage.promptTokens,
            CompletionTokens: response.usage.completionTokens,
            TotalTokens: response.usage.totalTokens,
            InputCost: `$${response.cost.input.toFixed(6)}`,
            OutputCost: `$${response.cost.output.toFixed(6)}`,
            TotalCost: `$${response.cost.total.toFixed(6)}`
        });

    }
    catch (error) {

        console.error();
        console.error("===== ERROR =====");
        console.error();

        console.error("Message :", error.message);
        console.error("Status  :", error.status);
        console.error("Provider:", error.provider);
        console.error("Retry   :", error.retryable);

        if (error.raw) {
            console.error();
            console.error(error.raw);
        }

        process.exit(1);

    }

}

main();
