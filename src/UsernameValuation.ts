export interface IValuationStrategy {
  evaluate(username: string, currentValuation: number): Promise<number>;
}

export class UsernameValuation implements IValuationStrategy {
  private strategies: IValuationStrategy[] = [];

  public addStrategy(strategy: IValuationStrategy): void {
    this.strategies.push(strategy);
  }

  public async evaluate(username: string): Promise<number> {
    let totalValue = 0;
    for (const strategy of this.strategies) {
      totalValue = await strategy.evaluate(username, totalValue);
    }
    return totalValue;
  }
}
