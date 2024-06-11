import { TgApiService } from './tg/tg-api-service';
import { TgNameValuator } from './tgNameValuator';

(async () => {
  // TODO: Change it
  const apiId = 12345;
  const apiHash = 'asdfhj';

  const valuator = new TgNameValuator({apiId, apiHash});

  try {
    // await valuator.loadDictionary();
    // const name = 'yandex';

    // const price = await valuator.valuate(name);
    // console.log(`The cost of the name "${name}" is ${price}`);


    const tgApiService = new TgApiService({ apiId, apiHash });
    const username = 'hamster_kombat';
    const channelData = await tgApiService.getChannelInfo(username);
    
    if (channelData) {
      console.log(`Channel: ${username}`);
      console.log(`Subscribers: ${channelData?.participantsCount}`);
    } else {
      console.log('Channel not found!');
    }
    await tgApiService.destroy();

  } catch (error: any) {
    console.error(error?.message);
  }
})();
