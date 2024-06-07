import { DictionarySiteEntity } from "../entities/DictionarySiteEntity";
import axios from "axios";
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from "typeorm";

export interface IBaseConfig {
  fileName?: string;
}

export abstract class BaseSource {
  abstract get url(): string;
  protected abstract dataAdapter(row: string[]): string;
  protected config!: IBaseConfig;

  constructor(
    protected dataSource: DataSource,
  ) { }

  /**
   * Fetching data from source and update dictionary in DB
   */
  public async fetchAndUpdateData(): Promise<void> {
    const response = await axios.get(this.url, { responseType: 'stream' });
    const results: Set<string> = new Set();
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
          const parsedSiteName = this.dataAdapter(row);
          if (this.validateSiteNameForDictionary(parsedSiteName)) {
            const namesArray = this.extractsNamesFromSiteName(parsedSiteName);
            for (const name of namesArray) {
              results.add(name);
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
   * Save received set of names to DB
   * @param results Set of names
   */
  public async saveData(results: Set<string>): Promise<void> {
    const dictionaryRepository = this.dataSource.getRepository(DictionarySiteEntity);
    await dictionaryRepository.clear();

    for (const siteName of results) {
      const entry = new DictionarySiteEntity();
      entry.name = siteName;
      await dictionaryRepository.save(entry);
    }
  }

  /**
   * Extracts all forms of a name from a given site name 
   * @param siteName Source site name
   * @returns Array of received names
   */
  private extractsNamesFromSiteName(siteName: string): string[] {
    const results = [];
    if (siteName.includes('-')) {
      results.push(siteName.replaceAll('-', '_'));
      results.push(siteName.replaceAll('-', ''));
    }
    return results;
  }

  /**
   * Validate site name for adding to dictionary
   * @param siteName Source site name
   * @returns true if site name is valid
   */
  private validateSiteNameForDictionary(siteName: string): boolean {
    const MIN_LENGTH = 4;
    return siteName?.length >= MIN_LENGTH;
  }
}
