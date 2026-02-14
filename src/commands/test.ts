
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigLoader } from '../config/loader';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { UNIT_TEST_PROMPT } from '../core/prompts/roles';
import ora from 'ora';

export async function testCommand(file: string) {
    const spinner = ora('Writing tests...').start();

    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
        spinner.fail(`File not found: ${file}`);
        return;
    }

    const configLoader = new ConfigLoader();
    const config = configLoader.load(); // Assuming config is needed for context later

    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        spinner.fail('API Key missing.');
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const ai = new OpenAIAdapter(apiKey);
    const prompt: AIMessage[] = [
        { role: 'system', content: UNIT_TEST_PROMPT },
        { role: 'user', content: `Generate tests for this file:\n\n${content}` }
    ];

    try {
        const tests = await ai.complete(prompt);

        // Heuristic for test filename
        const parsed = path.parse(filePath);
        const testFilename = `${parsed.name}.test${parsed.ext}`;
        const testFilePath = path.join(parsed.dir, testFilename);

        fs.writeFileSync(testFilePath, tests.replace(/```(typescript|ts|javascript|js)?\n/g, '').replace(/```$/g, ''));

        spinner.succeed('Tests generated! 🧪');
        console.log(chalk.dim(`Saved to ${testFilePath}`));

    } catch (err: any) {
        spinner.fail(`Test generation failed: ${err.message}`);
    }
}
