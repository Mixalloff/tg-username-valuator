import logger from "../logger";
import { TgBotApiService } from "./TgBotApiService";

export class TgBotApiServiceManager {
  private currentBotIndex: number = 0;
  private currentBot!: TgBotApiService;
  private firstFailedBotIndex: number | null = null; 

  constructor(
    private botAuthTokens: string[],
  ) {
    this.initNewActiveBot();
  }

  async getChannelParticipantsCount(username: string): Promise<number | null> {
    try {
      const participantsCount = await this.currentBot.getChannelParticipantsCount(username);
      this.firstFailedBotIndex = null;
      return participantsCount;
    } catch (err: any) {
      // error.response.data.error_code:
      // 429 - Too Many Requests: retry after
      // 420 - FLOOD
      const floodErrorCodes = [420, 429];
      if (floodErrorCodes.includes(err.error_code)) {
        this.checkBotBlockLooping();
        logger.warn(`[getChannelMembersCount] Rate limit error (${err.error_code}) for bot ${this.currentBotIndex}. Switching bot.`);
        this.switchBot();
        // Retry the request with the new bot
        return this.getChannelParticipantsCount(username);
      } else {
        logger.error(`Error fetching member count for ${username}: ${err.error_code}, ${err.description}`);
        return null;
      }
    }
  }

  private checkBotBlockLooping() {
    if (this.currentBotIndex === this.firstFailedBotIndex) {
      logger.error(`[getChannelParticipantsCount] All bots was blocked!`);
      process.exit(1);
    } else {
      this.firstFailedBotIndex = this.firstFailedBotIndex === null
        ? this.currentBotIndex
        : this.firstFailedBotIndex;
    }
  }

  private switchBot() {
    this.currentBotIndex = (this.currentBotIndex + 1) % this.botAuthTokens.length;
    this.initNewActiveBot();
    logger.info(`[switchBot] Switched to bot with index ${this.currentBotIndex}`);
  }

  private initNewActiveBot() {
    this.currentBot = new TgBotApiService(this.botAuthTokens[this.currentBotIndex]);
  }

}
