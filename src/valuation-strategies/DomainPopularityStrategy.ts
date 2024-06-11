import { DataSource } from "typeorm";
import { IValuationStrategy } from "../UsernameValuation";
import { dbDataSource } from "../DbDataSource";
import { DictionaryDomainEntity } from "../entities/DictionaryDomainEntity";

export class DomainPopularityStrategy implements IValuationStrategy {
  private dbDataSource: DataSource = dbDataSource;

  public async evaluate(username: string, currentValuation: number): Promise<number> {
    const dictionaryRepository = this.dbDataSource.getRepository(DictionaryDomainEntity);
    const entry = await dictionaryRepository.findOne({ where: { name: username } });

    const domainPopularityKoef = await this.getDomainPopularityKoef(entry);
    if (entry) {
      console.log(`[DomainPopularityStrategy] Domain ${entry?.name} with popularity ${entry?.popularity} has koefficient ${domainPopularityKoef}`);
    } else {
      console.log(`[DomainPopularityStrategy] Domain ${username} not found in dictionary`);
    }
    return currentValuation * domainPopularityKoef;
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
