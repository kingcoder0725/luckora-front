export interface CurrencyProps {
  _id: string;
  symbol: string;
  name?: string;
  payment?: string;
  adminAddress?: string;
  contractAddress?: string;
  network?: string;
  abi?: any;
  betLimit?: number;
  price: number;
  maxBet?: number;
  minBet?: number;
  minDeposit?: number;
  minWithdraw?: number;
  icon?: string;
  buyUrl?: string;
  type?: number;
  status?: boolean;
  deposit?: boolean;
  withdrawal?: boolean;
  label?: string;
  isFiat: boolean;
}

export interface ICryptoCurrency {
  symbol: string;
  name: string;
  icon: string;
  withdrawable: boolean;
}

export interface ICryptoToken {
  crypto_amount: string;
  crypto_symbol: string;
  crypto_currency?: string;
  fiat_amount?: number;
  fiat_symbol?: string;
}

export interface BalanceProps {
  _id: string;
  balance: number;
  currency: CurrencyProps;
  disabled: boolean;
  status: boolean;
  userId: string;
  label?: string;
  bonus: number | undefined;
  activeBalance: number | undefined;
}

export interface TransactionsProps {
  _id: string;
  paymentId: string;
  address: string;
  amount: number;
  actually_paid: number;
  currencyId: CurrencyProps;
  symbol: string;
  ipn_type: string;
  status_text: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameProps {
  icon: string;
  name: string;
}

export interface HistoryProps {
  _id: string;
  amount: number;
  currency: string;
  game: GameProps;
  profit: number;
  status: string;
  username: string;
  createdAt: Date;
}

export type ITxTableFilters = {
  paymentId: string;
  coin: string[];
  status: string;
};

// new fiat interface
export interface CurrencyPropsFiat {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  countries: string[];
  icon?: string;
  status?: boolean;
}
// new fiat interface

// new balance interface
export interface BalancePropsFiat {
  _id: string;
  balance: number;
  currency: CurrencyPropsFiat;
  disabled: boolean;
  status: boolean;
  userId: string;
  label?: string;
  bonus: number;
}
// new balance interface
