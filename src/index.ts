import { TgNameValuator } from './tgNameValuator';

(async () => {
  const valuator = new TgNameValuator();

  try {
    await valuator.loadDictionary();
    const name = 'yandex';

    const price = await valuator.valuate(name);
    console.log(`The cost of the name "${name}" is ${price}`);
  } catch (error: any) {
    console.error(error?.message);
  }
})();
