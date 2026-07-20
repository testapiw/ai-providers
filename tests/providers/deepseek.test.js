import "dotenv/config";
import AIClient, { BillingPlugin, TelemetryPlugin } from "../../src/index.js";
import models from "../../config/models.json" with { type: "json" };

const ai = new AIClient({ models })
            .plugins( 
                new BillingPlugin(),
                new TelemetryPlugin()
            );

async function main() {

    try {

        const response = await ai.generate({

            model: "deepseek-v4-flash",

            system: "Ти досвідчений JavaScript розробник.",

            prompt: "Що таке Event Loop? Відповідь в трьох реченнях."

        });

        console.log();
        console.log("===== AI RESPONSE =====");
        console.log();
        console.log(response.text);
        console.log();

        console.table({

            Status: response.status,

            Provider: response.provider,

            Model: response.model,

            Duration: `${response.duration} ms`,

            PromptTokens: response.usage.promptTokens,

            CompletionTokens: response.usage.completionTokens,

            TotalTokens: response.usage.totalTokens,

            FinishReason: response.finishReason

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