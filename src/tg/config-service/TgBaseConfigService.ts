import * as fs from 'fs';

export interface ITgBaseInitConfig {

}

export class TgBaseConfigService<T> {
  protected config: T | null = null;

  constructor(
    protected configFilePath: string,
  ) {
    this.loadConfig();
  }

  private loadConfig() {
    if (fs.existsSync(this.configFilePath)) {
      const rawConfig = fs.readFileSync(this.configFilePath, 'utf8');
      this.config = JSON.parse(rawConfig);
    } else {
      this.config = null;
    }
  }

  public getConfig(): T {
    if (this.config) {
      return this.config;
    } else {
      throw new Error('Please login first using: tg-username-valuator login');
    }
  }

  public saveConfig(config: T) {
    fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
    this.config = config;
  }

  public get configExists(): boolean {
    return fs.existsSync(this.configFilePath);
  }
}
