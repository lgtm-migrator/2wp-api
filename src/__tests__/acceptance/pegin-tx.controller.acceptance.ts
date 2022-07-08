import {Client} from '@loopback/testlab';
import {TwpapiApplication} from '../..';
import {setupApplication} from './test-helper';
import * as constants from '../../constants';

describe('Pegin Tx Controller', () => {
  let app: TwpapiApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes POST /pegin-tx with P2PKH address', async () => {
    const peginConf = await client.get('/pegin-configuration').expect(200);
    const balances = await client
      .post('/balance')
      .send({
        sessionId: peginConf.body.sessionId,
        addressList: [
          {
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/44'/1'/0'/0/0",
            address: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
          },
          {
            path: [2147483692, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/44'/1'/0'/1/0",
            address: 'mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV',
          },
          {
            path: [2147483697, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/49'/1'/0'/0/0",
            address: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
          },
          {
            path: [2147483697, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/49'/1'/0'/1/0",
            address: '2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C',
          },
          {
            path: [2147483732, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/84'/1'/0'/0/0",
            address: 'tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0',
          },
          {
            path: [2147483732, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/84'/1'/0'/1/0",
            address: 'tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr',
          },
        ],
      })
      .expect(200);
    const amountToTransfer = balances.body.legacy - 10000;
    await client
      .post('/tx-fee')
      .send({
        sessionId: peginConf.body.sessionId,
        amount: amountToTransfer,
        accountType: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
      })
      .expect(200);
    const peginTxData = {
      sessionId: peginConf.body.sessionId,
      amountToTransferInSatoshi: amountToTransfer,
      refundAddress: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
      recipient: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      feeLevel: constants.BITCOIN_FAST_FEE_LEVEL,
      changeAddress: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
    };
    await client.post('/pegin-tx').send(peginTxData).expect(200);
  });
  it('invokes POST /pegin-tx with P2SH address', async () => {
    const peginConf = await client.get('/pegin-configuration').expect(200);
    const balance = await client
      .post('/balance')
      .send({
        sessionId: peginConf.body.sessionId,
        addressList: [
          {
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/44'/1'/0'/0/0",
            address: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
          },
          {
            path: [2147483692, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/44'/1'/0'/1/0",
            address: 'mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV',
          },
          {
            path: [2147483697, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/49'/1'/0'/0/0",
            address: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
          },
          {
            path: [2147483697, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/49'/1'/0'/1/0",
            address: '2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C',
          },
          {
            path: [2147483732, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/84'/1'/0'/0/0",
            address: 'tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0',
          },
          {
            path: [2147483732, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/84'/1'/0'/1/0",
            address: 'tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr',
          },
        ],
      })
      .expect(200);
    const amountToTransfer = balance.body.nativeSegwit - 100000;
    await client
      .post('/tx-fee')
      .send({
        sessionId: peginConf.body.sessionId,
        amount: amountToTransfer,
        accountType: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
      })
      .expect(200);
    const peginTxData = {
      sessionId: peginConf.body.sessionId,
      amountToTransferInSatoshi: amountToTransfer,
      refundAddress: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
      recipient: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      feeLevel: constants.BITCOIN_AVERAGE_FEE_LEVEL,
      changeAddress: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
    };
    await client.post('/pegin-tx').send(peginTxData).expect(200);
  });
  it('invokes POST /pegin-tx with bech32 address', async () => {
    const peginConf = await client.get('/pegin-configuration').expect(200);
    const balance = await client
      .post('/balance')
      .send({
        sessionId: peginConf.body.sessionId,
        addressList: [
          {
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/44'/1'/0'/0/0",
            address: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
          },
          {
            path: [2147483692, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/44'/1'/0'/1/0",
            address: 'mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV',
          },
          {
            path: [2147483697, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/49'/1'/0'/0/0",
            address: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
          },
          {
            path: [2147483697, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/49'/1'/0'/1/0",
            address: '2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C',
          },
          {
            path: [2147483732, 2147483649, 2147483648, 0, 0],
            serializedPath: "m/84'/1'/0'/0/0",
            address: 'tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0',
          },
          {
            path: [2147483732, 2147483649, 2147483648, 1, 0],
            serializedPath: "m/84'/1'/0'/1/0",
            address: 'tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr',
          },
        ],
      })
      .expect(200);
    await client
      .post('/tx-fee')
      .send({
        sessionId: peginConf.body.sessionId,
        amount: 200,
        accountType: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
      })
      .expect(200);
    const peginTxData = {
      sessionId: peginConf.body.sessionId,
      amountToTransferInSatoshi: balance.body.legacy,
      refundAddress: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
      recipient: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      feeLevel: constants.BITCOIN_FAST_FEE_LEVEL,
      changeAddress: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
    };
    await client
      .post('/pegin-tx')
      .send(peginTxData)
      .expect({
        error: {
          statusCode: 500,
          message: 'Internal Server Error',
        },
      });
  });
});
