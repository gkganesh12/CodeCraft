
import chalk from 'chalk';
import { RuleValidator } from '../core/rules';
import { ConfigLoader } from '../config/loader';
import { execSync } from 'child_process';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { QA_ROLE } from '../core/prompts/roles';

export async function verifyCommand() {
    console.log(chalk.blue('Verification Phase... 🛡️'));

    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    if (!config) return;

    // 1. Run Rule Validator
    console.log('Running Architecture Rules...');
    const validator = new RuleValidator(config);
    const violations = validator.validate();

    if (violations.length === 0) {
        console.log(chalk.green('✅ No architectural violations found.'));
    } else {
        console.log(chalk.red(`❌ Found ${violations.length} violations:`));
        violations.forEach(v => {
            console.log(chalk.red(`   [${v.severity.toUpperCase()}] ${v.ruleName}: ${v.description}`));
        });
    }

    // 2. Run Tests (Mock)
    try {
        console.log('\nRunning Project Tests...');
        // execSync('npm test', { stdio: 'inherit' }); // Commented out for MVP safety
        console.log(chalk.yellow('ℹ️  Skipped "npm test" (configure in settings)'));
    } catch (e) {
        console.log(chalk.red('Tests Failed.'));
    }

    // 3. AI Auditor Risk Assessment
    console.log(chalk.blue('\n🤖 AI Auditor is assessing risk...'));
    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
        const ai = new OpenAIAdapter(apiKey);
        // We'd ideally feed the diff, but for now we feed the plan and rule violations
        const prompt: AIMessage[] = [
            { role: 'system', content: QA_ROLE },
            { role: 'user', content: `Analyze the risk of this deployment based on these violations:\n${JSON.stringify(violations)}` }
        ];
        try {
            const audit = await ai.complete(prompt);
            console.log(chalk.cyan('\n📋 QA Audit Report:\n'));
            console.log(audit);
        } catch (e) {
            console.error(chalk.red('AI Audit Failed.'));
        }
    } else {
        console.log(chalk.yellow('Skipping AI Audit (No API Key).'));
        console.log(chalk.green('RISK SCORE:    4/100 (LOW) [MOCK]'));
    }
}
