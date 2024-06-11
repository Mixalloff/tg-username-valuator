import { TgUsernameValuator } from './TgUsernameValuator';
import { TgApiService } from './tg/TgApiService';

(async () => {
  const valuator = new TgUsernameValuator();

  try {
    // await valuator.loadDictionary();
    // const name = 'yandex';

    // const price = await valuator.valuate(name);
    // console.log(`The cost of the name "${name}" is ${price}`);


    const tgApiService = new TgApiService();
    const username = 'hamster_kombat';
    const channelData = await tgApiService.getChannelInfo(username);
    
    if (channelData) {
      console.log(`Channel: ${username}`);
      console.log(`Subscribers: ${channelData?.participantsCount}`);
    } else {
      console.log('Channel not found!');
    }
    process.exit();
  } catch (error: any) {
    console.error(error?.message);
  }
})();
