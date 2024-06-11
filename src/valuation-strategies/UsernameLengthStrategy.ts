import { IValuationStrategy } from "../UsernameValuation";

export class UsernameLengthStrategy implements IValuationStrategy {

  public async evaluate(username: string, currentValuation: number): Promise<number> {
    const lengthValuation = () => {
      switch (username.length) {
        case 4: return 5050;
        case 5: return 515;
        default: return 104;
      }
    };
    const result = Math.max(currentValuation, lengthValuation());
    console.log(`[UsernameLengthStrategy] Valuation of ${username} by length is ${result} TON`);
    return result;
  }
}