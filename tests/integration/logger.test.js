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

    const requests = [];

    const count = 20;

    console.log("----------------------------------------");
    console.log(` Concurrent Test (${count} requests)`);
    console.log("----------------------------------------");

    const started = Date.now();

    for (let i = 1; i <= count; i++) {

        requests.push(

            ai.generate({

                model: "deepseek-v4-flash",

                system: "Ти досвідчений JavaScript розробник.",

                prompt: `Відповідь одним реченням. Запит №${i}. Що таке Event Loop?`

            })

            .then(response => {

                console.log(
                    `✓ ${i}: ${response.duration} ms`
                );

                return response;

            })

            .catch(error => {

                console.error(
                    `✗ ${i}: ${error.message}`
                );

                throw error;

            })

        );

    }

    const responses = await Promise.all(requests);

    const duration = Date.now() - started;

    const totalTokens = responses.reduce(

        (sum, item) => sum + item.usage.totalTokens,

        0

    );

    const totalCost = responses.reduce(

        (sum, item) => sum + item.cost.total,

        0

    );

    console.log();
    console.log("===== SUMMARY =====");
    console.log();

    console.table({

        Requests: count,

        Duration: `${duration} ms`,

        TotalTokens: totalTokens,

        TotalCost: `$${totalCost.toFixed(6)}`

    });

}

main().catch(error => {

    console.error();
    console.error("===== ERROR =====");
    console.error();

    console.error(error);

    process.exit(1);

});
