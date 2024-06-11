import { DataSource } from 'typeorm';
import { dbDataSource } from './DbDataSource';
import { TrancoListSource } from './website-sources/TrancoListSource';
import { TgApiService } from './tg/TgApiService';

export class TgUsernameValuator {
  private dbDataSource: DataSource = dbDataSource;
  private isInitializedDataSource = this.initializeDataSource();

  /**
   * Load dictionary from source and update database
   */
  public async loadDictionary(requestedSitesCount: number = 10000): Promise<void> {
    try {
      await this.isInitializedDataSource;
      const source = new TrancoListSource(this.dbDataSource, { requestedSitesCount });
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
    const tgApiService = new TgApiService();
    const channel = await tgApiService.getChannelInfo(name);
    if (!channel) {
      return 0;
    } else {
      return channel.participantsCount || 0;
    }

    // try {
    //   await this.isInitializedDataSource;
    //   const dictionaryRepository = this.dbDataSource.getRepository(DictionarySiteEntity);
    //   const entry = await dictionaryRepository.findOne({ where: { name } });
  
    //   if (!entry) {
    //     return null;
    //   }
  
    //   return this.valuateByLength(entry?.name);
    // } catch(err: any) {
    //   throw new Error(`An error occurred while validating the username: ${err?.message}`);
    // }
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

  /**
   * Initialize DataSource before using 
   */
  private async initializeDataSource(): Promise<void> {
    if (!this.dbDataSource.isInitialized) {
      try {
        await this.dbDataSource.initialize();
        console.log('Data Source has been initialized!');
      } catch(err) {
        console.error('Error during Data Source initialization', err);
      }
    }
  }
}
