import { DataSource } from "typeorm";
import { BaseSource, IBaseConfig } from "./BaseSource";

export interface ITrancoListConfig extends IBaseConfig {
  requestedSitesCount?: number;
}

export class TrancoListSource extends BaseSource {
  private defaultConfig: ITrancoListConfig = {
    requestedSitesCount: 10000,
    fileName: 'tranco-list.csv'
  };

  constructor(
    protected dataSource: DataSource,
    protected config: ITrancoListConfig,
  ) {
    super(dataSource);
    this.config = {...this.defaultConfig, ...this.config};
  }

  get url(): string {
    const requestedSitesCount = this.config?.requestedSitesCount
      || this.defaultConfig.requestedSitesCount;
    return `https://tranco-list.eu/download/KJWNW/${requestedSitesCount}`;
  }

  protected dataAdapter(row: string[]): string {
    const domain = row[1];
    const siteName = domain.split('.')[0];
    return siteName;
  }
}
