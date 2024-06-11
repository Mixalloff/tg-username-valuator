#!/usr/bin/env node

import { Command } from 'commander';
import { TelegramClient } from 'telegram';
import { StoreSession } from 'telegram/sessions';
import readlineModule from 'readline';
import { TgUsernameValuator } from '../TgUsernameValuator';
import { TgConfigService } from '../tg/TgConfigService';

const program = new Command();
// const configFilePath = path.resolve(__dirname, '..', '..', 'tg-app.config.json');
const session = new StoreSession('tg_session');
const readline = readlineModule.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const configService = new TgConfigService();

async function login() {
  let config: { apiId: number, apiHash: string } | null;

  if (configService.configExists) {
    config = configService.getConfig();
  } else {
    config = {
      apiId: await new Promise(
        resolve => readline.question('Please enter your api_id: ', apiId => resolve(+apiId))
      ),
      apiHash: await new Promise(
        resolve => readline.question('Please enter your api_hash: ', resolve)
      ),
    };
    configService.saveConfig(config);
  }

  const client = new TelegramClient(session, config.apiId, config.apiHash, { connectionRetries: 5 });

  await client.start({
    phoneNumber: async () => await new Promise(
      resolve => readline.question('Please enter your number: ', resolve)
    ),
    password: async () => await new Promise(
      resolve => readline.question('Please enter your password: ', resolve)
    ),
    phoneCode: async () => await new Promise(
      resolve => readline.question('Please enter the code you received: ', resolve)
    ),
    onError: console.error,
  });

  console.log('You should now be connected.');
  console.log('Session saved.');
  process.exit();
}

async function valuate(username: string) {
  if (!configService.configExists) {
    console.log('Please login first using: tg-username-valuator login');
    process.exit();
  }

  const valuator = new TgUsernameValuator();
  const value = await valuator.valuate(username);
  console.log(`The estimated value of @${username} is ${value} TON`);
  process.exit();
}

async function loadDomains(count = 10000) {
  const valuator = new TgUsernameValuator();
  try {
    console.log('Started load domains list');
    await valuator.loadDictionary(count);
    console.log('Domains dictionary successfully loaded');
  } catch (err) {
    console.log('Error while loading domains: ', err);
  }
  process.exit();
}

program
  .command('login')
  .description('Log in to Telegram')
  .action(login);

program
  .command('valuate <username>')
  .description('Evaluate the value of a Telegram username')
  .action(valuate);

program
  .command('load-domains <count>')
  .description('Load domains dictionary')
  .action(loadDomains);

program.parse(process.argv);
