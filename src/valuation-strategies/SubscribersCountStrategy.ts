import { IValuationStrategy } from "../UsernameValuation";
import logger from "../logger";
import { TgClientApiService } from "../tg/TgClientApiService";

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
    const tgApiService = new TgClientApiService();
    await tgApiService.connectClient();
    const channel = await tgApiService.getChannelInfo(username);
    await tgApiService.disconnectClient();
    if (!channel?.participantsCount) {
      logger.info(`[SubscriberCountStrategy] No channel found or participants count is unavailable. Valuation is ${currentValuation} TON`);
      // Return the same valuation if the channel not found or has no public participants count
      return currentValuation;
    } else {
      const totalValue = Math.max(currentValuation, channel.participantsCount * this.config.valuePerSubscriberTON);
      logger.info(`[SubscriberCountStrategy] Participants count is ${channel.participantsCount}. Total value: ${totalValue} TON`);
      return totalValue;
    }
  }
}
