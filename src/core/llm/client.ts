
import OpenAI from 'openai';

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIClient {
    complete(messages: AIMessage[]): Promise<string>;
}

export class OpenAIAdapter implements AIClient {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = 'gpt-4') {
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async complete(messages: AIMessage[]): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: messages,
            });
            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to complete AI request');
        }
    }
}
