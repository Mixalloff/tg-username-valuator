import { DataSource } from "typeorm";
import { IValuationStrategy } from "../UsernameValuation";
import { dbDataSource } from "../DbDataSource";
import { DictionaryDomainEntity } from "../entities/DictionaryDomainEntity";
import logger from "../logger";

export class DomainPopularityStrategy implements IValuationStrategy {
  private dbDataSource: DataSource = dbDataSource;
  private valuePerSubscriberTON: number = 0.01;

  public async evaluate(username: string, currentValuation: number): Promise<number> {
    const dictionaryRepository = this.dbDataSource.getRepository(DictionaryDomainEntity);
    const entry = await dictionaryRepository.findOne({ where: { name: username } });

    const domainPopularityKoef = await this.getDomainPopularityKoef(entry);
    if (entry) {
      logger.info(`[DomainPopularityStrategy] Domain ${entry?.name} with popularity ${entry?.popularity} has koefficient ${domainPopularityKoef}`);
    } else {
      logger.info(`[DomainPopularityStrategy] Domain ${username} not found in dictionary`);
    }
    const domainPopularityValuation = currentValuation * domainPopularityKoef;
    const valuationBySubscriptions = this.valuateBySubscriptions(entry, domainPopularityValuation);
    return valuationBySubscriptions;
  }

  private valuateBySubscriptions(entry: DictionaryDomainEntity | null, baseValue: number): number {
    if (!entry) {
      return baseValue;
    }
    let tempResult = baseValue;
    if (entry.subscribers) {
      tempResult = Math.floor(this.valuePerSubscriberTON * entry.subscribers);
      logger.info(`[DomainPopularityStrategy] ${entry?.subscribers} subscriber found for ${entry.name}. Valuation is ${tempResult} TON`);
    }
    return Math.max(tempResult, baseValue);
  }

  private async getDomainPopularityKoef(entry: DictionaryDomainEntity | null): Promise<number> {
    const defaultKoef = 1;
    
    try {
      if (!entry) {
        return defaultKoef;
      }
  
      switch (true) {
        case entry.popularity < 10:
          return 100;
        case entry.popularity < 100:
          return 20;
        case entry.popularity < 1000:
          return 5;
        case entry.popularity <= 10_000:
          return 1.5;
        default:
          return 1;
      }
    } catch(err: any) {
      throw new Error(`An error occurred while searching "${entry?.name }": ${err?.message}`);
    }
  }
}
