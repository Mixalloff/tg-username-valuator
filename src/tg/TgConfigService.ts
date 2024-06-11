import * as fs from 'fs';
import * as path from 'path';

const configFilePath = path.resolve(__dirname, '..', '..', 'tg-app.config.json');

export interface ITgInitConfig {
  apiId: number;
  apiHash: string;
}

export class TgConfigService {
  private config: ITgInitConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    if (fs.existsSync(configFilePath)) {
      const rawConfig = fs.readFileSync(configFilePath, 'utf8');
      this.config = JSON.parse(rawConfig);
    } else {
      this.config = null;
    }
  }

  public getConfig(): ITgInitConfig {
    if (this.config) {
      return this.config;
    } else {
      throw new Error('Please login first using: tg-username-valuator login');
    }
  }

  public saveConfig(config: ITgInitConfig) {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    this.config = config;
  }

  public get configExists(): boolean {
    return fs.existsSync(configFilePath);
  }
}