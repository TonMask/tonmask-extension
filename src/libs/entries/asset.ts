export interface JettonParams {
  type: "jetton";
  // The address of the token contract
  address: string;
  // A ticker symbol or shorthand, up to 11 characters
  symbol?: string;
  // A string url of the token logo
  image?: string;
  // A jetton name
  name?: string;
}

export interface JettonState {
  symbol: string;
  name: string;
  image?: string;
}

export interface JettonAsset {
  state: JettonState;
  minterAddress: string;
  walletAddress?: string;
}

export type Asset = JettonAsset;
