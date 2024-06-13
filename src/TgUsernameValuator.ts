import { DataSource, IsNull } from 'typeorm';
import { dbDataSource } from './DbDataSource';
import { UsernameValuation } from './UsernameValuation';
import { DomainPopularityStrategy } from './valuation-strategies/DomainPopularityStrategy';
import { TrancoListDomainsSource } from './domain-sources/TrancoListDomainsSource';
import { UsernameLengthStrategy } from './valuation-strategies/UsernameLengthStrategy';
import { DictionaryDomainEntity } from './entities/DictionaryDomainEntity';
import { TgBotApiServiceManager } from './tg/TgBotApiServiceManager';
import logger from './logger';
import { TgBotConfigService } from './tg/config-service/TgBotConfigService';

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
      logger.info('Pulling dictionary...');
      await source.fetchAndUpdateData();
      logger.info('Data loaded into dictionary')
    } catch (err: any) {
      logger.error(`Error during loading data ${JSON.stringify(err)}`)
    }
  }

  /**
   * Check domains for channels and number of subscribers
   */
  public async checkDomainsForChannels() {
    try {
      await this.isInitializedDataSource;
      
      const dictionaryRepository = this.dbDataSource.getRepository(DictionaryDomainEntity);
      const domainEntitiesList = await dictionaryRepository.find({
        where: [
          { updatedAt: IsNull() }, // update only rows which was not updated before
        ],
      });
      logger.info(`[checkDomainsForChannels] Will be updated ${domainEntitiesList.length} rows.`);
      logger.info(`[checkDomainsForChannels] Started from ${JSON.stringify(domainEntitiesList[0])}`);

      const config = new TgBotConfigService();
      const botAuthTokens = config.getConfig();
      const tgApiServiceManager = new TgBotApiServiceManager(botAuthTokens);
      for (let domainEntity of domainEntitiesList) {
        const subscribers = await tgApiServiceManager.getChannelParticipantsCount(domainEntity.name);
        const updatedAt = new Date().toISOString(); 

        logger.info(`popularity: ${domainEntity.popularity}, name: ${domainEntity.name}, subscribers: ${subscribers}`);
        if (subscribers) {
          dictionaryRepository.save({ 
            ...domainEntity, 
            subscribers,
            updatedAt,
          });
        } else {
          dictionaryRepository.save({ 
            ...domainEntity,
            updatedAt,
          });
        }
        // Delay between requests in ms
        const DELAY_MS = 2000;
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    } catch (err) {
      logger.error(`[checkDomainsForChannels] Error during check domains: ${JSON.stringify(err)}`);
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
    // valuation.addStrategy(new SubscriberCountStrategy());
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
        logger.info('Data Source has been initialized!');
      } catch(err) {
        logger.error(`Error during Data Source initialization: ${JSON.stringify(err)}`);
      }
    }
  }
}
