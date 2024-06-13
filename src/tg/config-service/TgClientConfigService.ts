import * as path from 'path';
import { ITgBaseInitConfig, TgBaseConfigService } from './TgBaseConfigService';

const configFilePath = path.resolve(__dirname, '..', '..', 'tg-client.config.json');

export interface ITgClientInitConfig extends ITgBaseInitConfig {
  apiId: number;
  apiHash: string;
}

export class TgClientConfigService extends TgBaseConfigService<ITgClientInitConfig> {
  constructor() {
    super(configFilePath);
  }
}
