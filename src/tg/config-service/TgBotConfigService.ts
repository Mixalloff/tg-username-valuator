import * as path from 'path';
import { TgBaseConfigService } from './TgBaseConfigService';

const configFilePath = path.resolve(__dirname, '..', '..', 'tg-bot.config.json');

// bot auth tokens array - [ 'token1', 'token2', ...]
export type ITgBotInitConfig = Array<string>;

export class TgBotConfigService extends TgBaseConfigService<ITgBotInitConfig> {
  constructor() {
    super(configFilePath);
  }
}
