import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {config} from 'dotenv';

config();

const blockBookUrl = process.env.BLOCKBOOK_URL ?? 'https://blockbook.trugroup.tech:19130';

const confg = {
  name: 'txFeeProvider',
  connector: 'rest',
  options: {
    headers: {
      accept: 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'content-type': 'application/json',
    },
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: `${blockBookUrl}/api/v1/estimatefee/{block}`,
        responsePath: '$..*',
      },
      functions: {
        feeProvider: ['block'],
      },
    },
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class TxFeeProviderDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'txFeeProvider';

  static readonly defaultConfig = confg;

  constructor(
    @inject('datasources.config.txFeeProvider', {optional: true})
    dsConfig: object = confg,
  ) {
    super(dsConfig);
  }
}
