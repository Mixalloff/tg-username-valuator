import { DataSource } from 'typeorm';
import { dataSource } from './data-source';
import { DictionarySiteEntity } from './entities/DictionarySiteEntity';
import { TrancoListSource } from './sources/TrancoListSource';

export class TgNameValuator {
  private dataSource: DataSource = dataSource;

  constructor() {
    this.dataSource.initialize()
      .then(() => {
        console.log('Data Source has been initialized!')
      })
      .catch((err) => {
        console.error('Error during Data Source initialization', err)
      });
  }

  /**
   * Load dictionary from source and update database
   */
  public async loadDictionary(): Promise<void> {
    try {
      const source = new TrancoListSource(this.dataSource, { requestedSitesCount: 100 });
      console.log('Pulling dictionary...');
      await source.fetchAndUpdateData();
      console.log('Data loaded into dictionary')
    } catch (err) {
      console.error('Error during loading data', err)
    }
  }

  /**
   * Valuate tg username
   * @param name Source username for evaluating
   * @returns Estimated cost of the username
   */
  public async valuate(name: string): Promise<number | null> {
    try {
      const dictionaryRepository = this.dataSource.getRepository(DictionarySiteEntity);
      const entry = await dictionaryRepository.findOne({ where: { name } });
  
      if (!entry) {
        return null;
      }
  
      return this.valuateByLength(entry?.name);
    } catch(err: any) {
      throw new Error(`An error occurred while validating the username: ${err?.message}`);
    }
  }

  /**
   * Valuate name by length
   * @param name Source name
   * @returns Estimated cost of the name
   */
  private valuateByLength(name: string): number {
    // TODO: add more valuable logic 
    switch (name.length) {
      case 4: return 5050;
      case 5: return 515;
      default: return 104;
    }
  }
}
