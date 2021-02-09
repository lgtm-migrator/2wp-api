import {Model, model, property} from '@loopback/repository';
import {AddressBalance} from './address-balance.model';

@model({settings: {strict: false}})
export class AccountBalance extends Model {
  @property({
    type: 'number',
    required: true,
  })
  legacy: number;

  @property({
    type: 'number',
    required: true,
  })
  segwit: number;

  @property({
    type: 'number',
    required: true,
  })
  nativeSegwit: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AccountBalance>) {
    super(data);
  }

  public calculateWalletBalance(addressBalances: AddressBalance[]): void {
    const [legacyTestReg, segwitTestReg, nativeTestReg] = [
      /^[mn][1-9A-HJ-NP-Za-km-z]{26,35}/,
      /^[2][1-9A-HJ-NP-Za-km-z]{26,35}/,
      /^[tb][1-9A-HJ-NP-Za-z]{26,41}/];
    addressBalances.forEach((addressBalance) => {
      const utxoSatoshis = addressBalance.utxoList
        ?.map((utxo) => utxo.satoshis);
      if(utxoSatoshis && utxoSatoshis.length > 0){
        const addressAmount: number = utxoSatoshis.reduce((accumulator, satoshis) => satoshis + accumulator);
        if (legacyTestReg.test(addressBalance.address)) this.legacy += addressAmount;
        else if (segwitTestReg.test(addressBalance.address)) this.segwit += addressAmount;
        else if (nativeTestReg.test(addressBalance.address)) this.nativeSegwit += addressAmount;
      }
    });
  }
}

export interface AccountBalanceRelations {
  // describe navigational properties here
}

export type AccountBalanceWithRelations = AccountBalance & AccountBalanceRelations;
