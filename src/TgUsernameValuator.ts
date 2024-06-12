import { DataSource } from 'typeorm';
import { dbDataSource } from './DbDataSource';
import { UsernameValuation } from './UsernameValuation';
import { SubscriberCountStrategy } from './valuation-strategies/SubscribersCountStrategy';
import { DomainPopularityStrategy } from './valuation-strategies/DomainPopularityStrategy';
import { TrancoListDomainsSource } from './domain-sources/TrancoListDomainsSource';
import { UsernameLengthStrategy } from './valuation-strategies/UsernameLengthStrategy';
import { TgApiService } from './tg/TgApiService';
import { DictionaryDomainEntity } from './entities/DictionaryDomainEntity';

export class TgUsernameValuator {
  private dbDataSource: DataSource = dbDataSource;
  private isInitializedDataSource = this.initializeDataSource();

  /**
   * Load dictionary from source and update database
   */
  public async loadDictionary(requestedDomainsCount: number = 10000): Promise<void> {
    try {
      await this.isInitializedDataSource;
      const source = new TrancoListDomainsSource(this.dbDataSource, { requestedDomainsCount });
      console.log('Pulling dictionary...');
      await source.fetchAndUpdateData();
      console.log('Data loaded into dictionary')
    } catch (err) {
      console.error('Error during loading data', err)
    }
  }

  /**
   * Check domains for channels and number of subscribers
   */
  public async checkDomainsForChannels() {
    // TODO: here is a problem with limitations of Telegram API. Need to try Bot API 
    try {
      await this.isInitializedDataSource;
      
      const dictionaryRepository = this.dbDataSource.getRepository(DictionaryDomainEntity);
      const domainEntitiesList = await dictionaryRepository.find();

      const tgApiService = new TgApiService();
      await tgApiService.connectClient();
      for (let domainEntity of domainEntitiesList) {
        const channel = await tgApiService.getChannelInfo(domainEntity.name);

        console.log(domainEntity.popularity, domainEntity.name, channel?.participantsCount);
        if (channel) {
          const subscribers = channel?.participantsCount;
          dictionaryRepository.save({ ...domainEntity, subscribers });
        }
        // Delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      await tgApiService.disconnectClient();
    } catch (err) {
      console.error('Error during check domains', err)
    }
  }

  /**
   * Valuate tg username
   * @param username Source username for evaluating
   * @returns Estimated cost of the username
   */
  public async valuate(username: string): Promise<number | null> {
    await this.initializeDataSource;

    const valuation = new UsernameValuation();
    valuation.addStrategy(new UsernameLengthStrategy());
    valuation.addStrategy(new SubscriberCountStrategy());
    valuation.addStrategy(new DomainPopularityStrategy());

    const value = await valuation.evaluate(username);
    return value;
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
