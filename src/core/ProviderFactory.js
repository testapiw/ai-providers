import GoogleProvider from "../providers/GoogleProvider.js";
import AnthropicProvider from "../providers/AnthropicProvider.js";
import DeepSeekProvider from "../providers/DeepSeekProvider.js";
import OpenAIProvider from "../providers/OpenAIProvider.js";

const providers = {

    google: GoogleProvider,

    anthropic: AnthropicProvider,

    deepseek: DeepSeekProvider,

    openai: OpenAIProvider

};

export default class ProviderFactory {

    static create(model, config) {

        const Provider = providers[model.provider];

        if (!Provider) {

            throw new Error(
                `Provider "${model.provider}" not found`
            );

        }

        return new Provider(

            model,

            config

        );

    }

}