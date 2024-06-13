import { DictionaryDomainEntity } from "../entities/DictionaryDomainEntity";
import axios from "axios";
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from "typeorm";

export interface IBaseConfig {
  fileName?: string;
}

export interface IConvertedItem {
  popularity: string;
  domainName: string;
}

export abstract class BaseDomainsSource {
  abstract get url(): string;
  protected abstract dataAdapter(row: string[]): IConvertedItem;
  protected config!: IBaseConfig;

  constructor(
    protected dataSource: DataSource,
  ) { }

  /**
   * Fetching data from source and update dictionary in DB
   */
  public async fetchAndUpdateData(): Promise<void> {
    const response = await axios.get(this.url, { responseType: 'stream' });
    const results: Array<IConvertedItem> = [];
    const filePath = path.join(__dirname, this.config.fileName || 'temp.csv');

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ headers: false }))
        .on('data', (row: string[]) => {
          const {domainName, popularity} = this.dataAdapter(row);
          if (this.validateDomainNameForDictionary(domainName)) {
            const namesArray = this.extractsNamesFromDomainName(domainName);
            for (const domainName of namesArray) {
              const domainNameExists = results.find(({domainName: name}) => name === domainName);
              if (!domainNameExists) {
                results.push({ domainName, popularity });
              }
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    fs.unlinkSync(filePath);
    await this.saveData(results);
  }

  /**
   * Save received array of items to DB
   * @param results Array of converted items
   */
  public async saveData(results: Array<IConvertedItem>): Promise<void> {
    const dictionaryRepository = this.dataSource.getRepository(DictionaryDomainEntity);
    await dictionaryRepository.clear();

    for (const item of results) {
      const entry = new DictionaryDomainEntity();
      entry.name = item.domainName;
      entry.popularity = parseInt(item.popularity, 10);
      await dictionaryRepository.save(entry);
    }
  }

  /**
   * Extracts all forms of a name from a given domain name 
   * @param domainName Source domain name
   * @returns Array of received names
   */
  private extractsNamesFromDomainName(domainName: string): string[] {
    const results = [];
    const cleanDomainName = domainName.replaceAll(/[^a-z0-9-_]/gi, '');
    if (cleanDomainName.includes('-')) {
      results.push(cleanDomainName.replaceAll('-', '_'));
      results.push(cleanDomainName.replaceAll('-', ''));
    } else {
      results.push(cleanDomainName);
    }
    return results;
  }

  /**
   * Validate domain name for adding to dictionary
   * @param domainName Source domain name
   * @returns true if domain name is valid
   */
  private validateDomainNameForDictionary(domainName: string): boolean {
    const MIN_LENGTH = 4;
    return domainName?.length >= MIN_LENGTH;
  }
}
