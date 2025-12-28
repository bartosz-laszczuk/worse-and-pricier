/**
 * Manages reconnection attempts with exponential backoff
 */
export class ReconnectionStrategy {
  private attempts = 0;

  constructor(
    private readonly maxAttempts = 5,
    private readonly baseDelay = 1000,
    private readonly maxDelay = 10000
  ) {}

  /**
   * Increment attempt counter and return whether more attempts are allowed
   */
  incrementAttempt(): boolean {
    this.attempts++;
    return this.attempts <= this.maxAttempts;
  }

  /**
   * Get current attempt number (1-based)
   */
  getCurrentAttempt(): number {
    return this.attempts;
  }

  /**
   * Calculate delay for next reconnection attempt using exponential backoff
   * Formula: min(baseDelay * 2^(attempts-1), maxDelay)
   */
  getNextDelay(): number {
    return Math.min(
      this.baseDelay * Math.pow(2, this.attempts - 1),
      this.maxDelay
    );
  }

  /**
   * Check if reconnection attempts have been exhausted
   */
  isExhausted(): boolean {
    return this.attempts >= this.maxAttempts;
  }

  /**
   * Reset the strategy (on successful connection)
   */
  reset(): void {
    this.attempts = 0;
  }

  /**
   * Get max attempts configured
   */
  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}
