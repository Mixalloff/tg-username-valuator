import { TgUsernameValuator } from './TgUsernameValuator';
import logger from './logger';
import { TgClientApiService } from './tg/TgClientApiService';

(async () => {
  const valuator = new TgUsernameValuator();

  try {
    // await valuator.loadDictionary(10_000);
    await valuator.checkDomainsForChannels();
    // const name = 'yandex';

    // const price = await valuator.valuate(name);
    // logger.info(`The cost of the name "${name}" is ${price}`);


    // const tgApiService = new TgClientApiService();
    // const username = 'hamster_kombat';
    // await tgApiService.connectClient();
    // const channelData = await tgApiService.getChannelInfo(username);
    // await tgApiService.disconnectClient(); 
    
    // if (channelData) {
    //   logger.info(`Channel: ${username}`);
    //   logger.info(`Subscribers: ${channelData?.participantsCount}`);
    // } else {
    //   logger.info('Channel not found!');
    // }

    process.exit();
  } catch (error: any) {
    logger.error(error?.message);
  }
})();
