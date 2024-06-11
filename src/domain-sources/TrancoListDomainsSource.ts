import { DataSource } from "typeorm";
import { BaseDomainsSource, IBaseConfig, IConvertedItem } from "./BaseDomainsSource";

export interface ITrancoListConfig extends IBaseConfig {
  requestedDomainsCount?: number;
}

export class TrancoListDomainsSource extends BaseDomainsSource {
  private defaultConfig: ITrancoListConfig = {
    requestedDomainsCount: 10000,
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
    const requestedDomainsCount = this.config?.requestedDomainsCount
      || this.defaultConfig.requestedDomainsCount;
    return `https://tranco-list.eu/download/KJWNW/${requestedDomainsCount}`;
  }

  protected dataAdapter(row: string[]): IConvertedItem {
    // Here is non iterable object like { '0': 1, '1': 'google' } 
    const popularity = row?.[0];
    const domainName = row?.[1]?.split('.')[0];
    return { popularity, domainName };
  }
}
