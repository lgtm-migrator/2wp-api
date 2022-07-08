import {expect} from '@loopback/testlab';
import sinon, {SinonStubbedInstance} from 'sinon';
import {RskBlock} from '../../../models/rsk/rsk-block.model';
import {DaemonService} from '../../../services/daemon.service';
import {NodeBridgeDataProvider} from '../../../services/node-bridge-data.provider';
import {PeginStatusDataService} from '../../../services/pegin-status-data-services/pegin-status-data.service';
import {PeginStatusMongoDbDataService} from '../../../services/pegin-status-data-services/pegin-status-mongo.service';
import {PeginDataProcessor} from '../../../services/pegin-data.processor';
import RskBlockProcessorPublisher from '../../../services/rsk-block-processor-publisher';
import {
  RskChainSyncService,
  RskChainSyncSubscriber,
} from '../../../services/rsk-chain-sync.service';
import {getRandomHash} from '../../helper';

describe('Service: DaemonService', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('starts and stops', async () => {
    const mockedRskBlockProcessorPublisher = sinon.createStubInstance(
      NodeBridgeDataProvider,
    ) as SinonStubbedInstance<RskBlockProcessorPublisher>;
    const mockedPeginStatusDataService = <PeginStatusDataService>{};
    mockedPeginStatusDataService.start = sinon.stub();
    mockedPeginStatusDataService.stop = sinon.stub();
    const mockedRskSyncChainService = sinon.createStubInstance(
      RskChainSyncService,
    ) as SinonStubbedInstance<RskChainSyncService> & RskChainSyncService;
    const daemonService = new DaemonService(
      mockedRskBlockProcessorPublisher,
      mockedPeginStatusDataService,
      mockedRskSyncChainService,
      '0',
      new PeginDataProcessor(mockedPeginStatusDataService),
    );

    await daemonService.start();
    await daemonService.start();

    expect(daemonService.started).to.be.true;

    sinon.assert.calledOnce(mockedRskSyncChainService.start);
    sinon.assert.calledOnce(mockedRskBlockProcessorPublisher.addSubscriber);

    await daemonService.stop();

    expect(daemonService.started).to.be.false;
  });

  it('sync starts when service is started', async () => {
    const mockedRskBlockProcessorPublisher = sinon.createStubInstance(
      NodeBridgeDataProvider,
    ) as SinonStubbedInstance<RskBlockProcessorPublisher>;
    const mockedPeginStatusDataService = <PeginStatusDataService>{};
    mockedPeginStatusDataService.start = sinon.stub();
    mockedPeginStatusDataService.stop = sinon.stub();
    const mockedRskSyncChainService = sinon.createStubInstance(
      RskChainSyncService,
    ) as SinonStubbedInstance<RskChainSyncService> & RskChainSyncService;
    const daemonService = new DaemonService(
      mockedRskBlockProcessorPublisher,
      mockedPeginStatusDataService,
      mockedRskSyncChainService,
      '0',
      new PeginDataProcessor(mockedPeginStatusDataService),
    );

    clock.tick(1);

    expect(mockedRskSyncChainService.sync.notCalled).to.be.true;

    await daemonService.start();

    clock.tick(1);
    sinon.assert.calledOnce(mockedRskBlockProcessorPublisher.addSubscriber);
    expect(mockedRskSyncChainService.sync.called).to.be.true;
  });

  it('deletes pegins for forked blocks from storage', async () => {
    const mockedRskBridgeDataProvider = sinon.createStubInstance(
      NodeBridgeDataProvider,
    );
    const mockedPeginStatusDataService = sinon.createStubInstance(
      PeginStatusMongoDbDataService,
    );
    const mockedRskSyncChainService = sinon.createStubInstance(
      RskChainSyncService,
    ) as SinonStubbedInstance<RskChainSyncService> & RskChainSyncService;
    const mockedPeginDataProcessor = sinon.createStubInstance(
      PeginDataProcessor,
    ) as SinonStubbedInstance<PeginDataProcessor> & PeginDataProcessor;

    const deletedBlock = new RskBlock(1, getRandomHash(), getRandomHash());

    const daemonService = new DaemonService(
      mockedRskBridgeDataProvider,
      mockedPeginStatusDataService,
      mockedRskSyncChainService,
      '0',
      mockedPeginDataProcessor,
    );

    // Daemon should have subscribed to mockedRskSyncChainService events
    await daemonService.start();

    sinon.assert.calledOnce(mockedRskSyncChainService.subscribe);
    const subscriber = <RskChainSyncSubscriber>(
      mockedRskSyncChainService.subscribe.getCall(0).firstArg
    );

    // Fake the deletion of a block
    await subscriber.blockDeleted(deletedBlock);

    sinon.assert.calledOnce(
      mockedPeginStatusDataService.deleteByRskBlockHeight,
    );
  });
});
