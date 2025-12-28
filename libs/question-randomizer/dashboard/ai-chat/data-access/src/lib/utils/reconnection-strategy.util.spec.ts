import { ReconnectionStrategy } from './reconnection-strategy.util';

describe('ReconnectionStrategy', () => {
  it('should initialize with default values', () => {
    const strategy = new ReconnectionStrategy();

    expect(strategy.getCurrentAttempt()).toBe(0);
    expect(strategy.getMaxAttempts()).toBe(5);
    expect(strategy.isExhausted()).toBe(false);
  });

  it('should initialize with custom values', () => {
    const strategy = new ReconnectionStrategy(3, 500, 5000);

    expect(strategy.getMaxAttempts()).toBe(3);
  });

  it('should increment attempt counter', () => {
    const strategy = new ReconnectionStrategy();

    expect(strategy.incrementAttempt()).toBe(true);
    expect(strategy.getCurrentAttempt()).toBe(1);

    expect(strategy.incrementAttempt()).toBe(true);
    expect(strategy.getCurrentAttempt()).toBe(2);
  });

  it('should return false when max attempts exceeded', () => {
    const strategy = new ReconnectionStrategy(2);

    expect(strategy.incrementAttempt()).toBe(true);
    expect(strategy.incrementAttempt()).toBe(true);
    expect(strategy.incrementAttempt()).toBe(false);
  });

  it('should calculate exponential backoff delay', () => {
    const strategy = new ReconnectionStrategy(5, 1000, 10000);

    strategy.incrementAttempt();
    expect(strategy.getNextDelay()).toBe(1000); // 1000 * 2^0

    strategy.incrementAttempt();
    expect(strategy.getNextDelay()).toBe(2000); // 1000 * 2^1

    strategy.incrementAttempt();
    expect(strategy.getNextDelay()).toBe(4000); // 1000 * 2^2

    strategy.incrementAttempt();
    expect(strategy.getNextDelay()).toBe(8000); // 1000 * 2^3
  });

  it('should cap delay at max delay', () => {
    const strategy = new ReconnectionStrategy(10, 1000, 5000);

    strategy.incrementAttempt();
    strategy.incrementAttempt();
    strategy.incrementAttempt();
    strategy.incrementAttempt();

    expect(strategy.getNextDelay()).toBeLessThanOrEqual(5000);
  });

  it('should detect exhausted attempts', () => {
    const strategy = new ReconnectionStrategy(2);

    expect(strategy.isExhausted()).toBe(false);

    strategy.incrementAttempt();
    expect(strategy.isExhausted()).toBe(false);

    strategy.incrementAttempt();
    expect(strategy.isExhausted()).toBe(true);
  });

  it('should reset strategy', () => {
    const strategy = new ReconnectionStrategy();

    strategy.incrementAttempt();
    strategy.incrementAttempt();
    expect(strategy.getCurrentAttempt()).toBe(2);

    strategy.reset();
    expect(strategy.getCurrentAttempt()).toBe(0);
    expect(strategy.isExhausted()).toBe(false);
  });
});
