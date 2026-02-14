
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigLoader } from '../config/loader';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { FEATURE_PROMPT } from '../core/prompts/roles';
import ora from 'ora';

export async function featureCommand(description: string) {
    const spinner = ora('Designing feature...').start();

    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    if (!config) {
        spinner.fail('No config found.');
        return;
    }

    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        spinner.fail('API Key missing.');
        return;
    }

    const ai = new OpenAIAdapter(apiKey);
    const prompt: AIMessage[] = [
        { role: 'system', content: FEATURE_PROMPT },
        { role: 'user', content: `Feature Description: ${description}` }
    ];

    try {
        const spec = await ai.complete(prompt);
        // Save to docs/features/
        const featuresDir = path.join(process.cwd(), 'docs', 'features');
        fs.ensureDirSync(featuresDir);

        // simple sanitization for filename
        const filename = `feature-${Date.now()}.md`;
        const filePath = path.join(featuresDir, filename);

        fs.writeFileSync(filePath, spec);

        spinner.succeed('Feature Spec generated! 📝');
        console.log(chalk.dim(`Saved to ${filePath}`));
        console.log('\n' + spec.substring(0, 500) + '...\n'); // Preview

    } catch (err: any) {
        spinner.fail(`Feature generation failed: ${err.message}`);
    }
}
