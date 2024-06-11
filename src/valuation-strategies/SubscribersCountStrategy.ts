import { IValuationStrategy } from "../UsernameValuation";
import { TgApiService } from "../tg/TgApiService";

export interface ISubscriberCountStrategyConfig {
  valuePerSubscriberTON: number; // value per subscriber in TON
}

export class SubscriberCountStrategy implements IValuationStrategy {
  private config;
  private defaultConfig: ISubscriberCountStrategyConfig = {
    valuePerSubscriberTON: 0.01,
  };

  constructor(config: Partial<ISubscriberCountStrategyConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  public async evaluate(username: string, currentValuation: number): Promise<number> {
    const tgApiService = new TgApiService();
    const channel = await tgApiService.getChannelInfo(username);
    if (!channel?.participantsCount) {
      console.log(`[SubscriberCountStrategy] No channel found or participants count is unavailable. Valuation is ${currentValuation} TON`);
      // Return the same valuation if the channel not found or has no public participants count
      return currentValuation;
    } else {
      const totalValue = Math.max(currentValuation, channel.participantsCount * this.config.valuePerSubscriberTON);
      console.log(`[SubscriberCountStrategy] Participants count is ${channel.participantsCount}. Total value: ${totalValue} TON`);
      return totalValue;
    }
  }
}
