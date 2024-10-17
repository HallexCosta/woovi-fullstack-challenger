export const initializerCounters = () => {
  global.__COUNTERS__ = {
    tenant: 0,
    user: 0,
    account: 0,
    transaction: 0
  }
}
