import { Api, TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions";
import readlineModule from 'readline';
import { ITgInitConfig, TgConfigService } from "./TgConfigService";

export interface ITgApiServiceConfig {
  apiId: number,
  apiHash: string,
}

export class TgApiService {
  private TG_SESSION_STORAGE_KEY = 'tg_session';
  private client!: TelegramClient;
  private storeSession = new StoreSession(this.TG_SESSION_STORAGE_KEY);
  private readline = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  private tgAppConfig!: ITgInitConfig;
  private tgConfigService = new TgConfigService();

  constructor() {
    this.initClient();
  }

  public initClient() {
    this.tgAppConfig = this.tgConfigService.getConfig();
    this.client = new TelegramClient(
      this.storeSession,
      this.tgAppConfig.apiId,
      this.tgAppConfig.apiHash,
      { connectionRetries: 5 }
    );
  }

  public async connectClient() {
    await this.client.connect();
    if (await this.client.checkAuthorization()) {
      console.log('Client successfully connected and authorized');
    } else {
      console.log('Login is required');
      await this.login();
    }
  }

  public async disconnectClient() {
    this.client.disconnect();
  }

  public async login() {
    console.log('Enter your credentials below');
    await this.client.start({
      phoneNumber: async () => await new Promise(
        resolve => this.readline.question('Please enter your number: ', resolve)
      ),
      password: async () => await new Promise(
        resolve => this.readline.question('Please enter your password: ', resolve)
      ),
      phoneCode: async () => await new Promise(
        resolve => this.readline.question('Please enter the code you received: ', resolve)
      ),
      onError: console.error,
    });
    console.log('You should now be connected.');
    this.storeSession.save();
    console.log(`Session saved to ${this.TG_SESSION_STORAGE_KEY}`);
  }

  public async getChannelInfo(channelUsername: string): Promise<Api.ChannelFull | null> {
    try {
      // const result = await this.client.invoke(
      //   new Api.channels.GetParticipants({
      //     channel: channelUsername,
      //     filter: new Api.ChannelParticipantsRecent(),
      //     offset: 0,
      //     limit: 1,
      //     // hash: 0,
      //   })
      // );
      // return result.count;

      const channel = await this.client.getEntity(channelUsername);
      const fullChannel: Api.messages.ChatFull = await this.client.invoke(
        new Api.channels.GetFullChannel({ channel })
      );
      const channelDataWithParticipants = fullChannel.fullChat as Api.ChannelFull;

      return channelDataWithParticipants;
    } catch (error: any) {
      console.error(`Error fetching channel info: ${error.message}`);
      return null;
    }
  }
}
