import { Api, TelegramClient } from "telegram";
import { ITgBotInitConfig, TgBotConfigService } from "./config-service/TgBotConfigService";
import { StringSession } from "telegram/sessions";
import axios from "axios";
import logger from "../logger";


export class TgBotApiService {
  static BOT_API_URL = 'https://api.telegram.org/bot';

  constructor(
    private botAuthToken: string,
  ) {}

  async getChannelParticipantsCount(username: string): Promise<number | null> {
    try {
      const response = await axios.get(
        `${TgBotApiService.BOT_API_URL}${this.botAuthToken}/getChatMemberCount?chat_id=@${username}`
      );
      if (response.data.ok) {
        return response.data.result;
      } else {
        logger.error(`Error fetching member count for ${username}: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error: any) {
      // error.response.data.error_code:
      // 429 - Too Many Requests: retry after
      // 420 - FLOOD
      logger.error(`Error fetching participants count for ${username}: ${JSON.stringify(error.response.data)}`);
      throw error.response.data;
    }
  }
}
