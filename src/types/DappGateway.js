// @flow

export type DappGateway = {
  web3: Object,
  drizzleUtils: Object,
  ethAddress: String, // Current ETH Address
  attempted: Boolean, // Have we attempted to connect to web3 and drizzleUtils?
  hcashswapInstance: Object, // web3.eth.Contract instance (used for calls)
  hcashswapEvent$: Object, // RxJs stream of events
};
