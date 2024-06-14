#!/usr/bin/env node

import { Command } from 'commander';
import { TelegramClient } from 'telegram';
import { StoreSession } from 'telegram/sessions';
import readlineModule from 'readline';
import { TgUsernameValuator } from '../TgUsernameValuator';
import { ITgClientInitConfig, TgClientConfigService } from '../tg/config-service/TgClientConfigService';
import { TgBotConfigService } from '../tg/config-service/TgBotConfigService';
import logger from '../logger';

const program = new Command();
const session = new StoreSession('tg_session');
const readline = readlineModule.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const clientConfigService = new TgClientConfigService();
const botConfigService = new TgBotConfigService();

async function loginClient() {
  let config: ITgClientInitConfig | null;

  if (clientConfigService.configExists) {
    config = clientConfigService.getConfig();
  } else {
    config = {
      apiId: await new Promise(
        resolve => readline.question('Please enter your api_id: ', apiId => resolve(+apiId))
      ),
      apiHash: await new Promise(
        resolve => readline.question('Please enter your api_hash: ', resolve)
      ),
    };
    clientConfigService.saveConfig(config);
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
    onError: err => {
      logger.error(JSON.stringify(err));
    },
  });

  logger.info('You should now be connected.');
  logger.info('Session saved.');
  process.exit();
}

// async function loginBot() {
//   let config: ITgBotInitConfig | null;

//   if (botConfigService.configExists) {
//     config = botConfigService.getConfig();
//   } else {
//     config = await new Promise(
//       resolve => readline.question('Please enter your botAuthToken array: ', resolve)
//     ) || [],
//     botConfigService.saveConfig(config);
//   }

//   const client = new TelegramClient(new StringSession(''), 1, '1', { connectionRetries: 5 });

//   // await client.start({
//   //   ...config,
//   // });

//   logger.info('You should now be connected.');
//   logger.info('Session saved.');
//   process.exit();

// }

async function valuate(username: string) {
  if (!botConfigService.configExists) {
    logger.info('Please login first using: tg-username-valuator login');
    process.exit();
  }

  const valuator = new TgUsernameValuator();
  const value = await valuator.valuate(username);
  logger.info(`The estimated value of @${username} is ${value} TON`);
  process.exit();
}

async function loadDomains(count = 10000) {
  const valuator = new TgUsernameValuator();
  try {
    logger.info('Started load domains list');
    await valuator.loadDomainsDictionaryForce(count);
    logger.info('Domains dictionary successfully loaded');
  } catch (err) {
    logger.info(`Error while loading domains: ${err}`);
  }
  process.exit();
}

async function updateNewDomainSubscribers() {
  const valuator = new TgUsernameValuator();
  await valuator.checkDomainsForChannels();
  process.exit();
}

program
  .command('login-client')
  .description('Login as client to Telegram')
  .action(loginClient);

// program
//   .command('login-bot')
//   .description('Login as bot to Telegram')
//   .action(loginBot);

program
  .command('valuate <username>')
  .description('Evaluate the value of a Telegram username')
  .action(valuate);

program
  .command('load-domains <count>')
  .description('Load domains dictionary')
  .action(loadDomains);

program
  .command('update-subscribers')
  .description('Update domains subscribers count')
  .action(updateNewDomainSubscribers);

program.parse(process.argv);
