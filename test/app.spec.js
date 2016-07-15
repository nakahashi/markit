import {Application} from 'spectron';
import path from 'path';
import chai from 'chai';
chai.should();

describe ('app', function () {
  this.timeout(10000);

  beforeEach(() => {
    this.app = new Application({
      path: path.resolve(__dirname, '../node_modules/.bin/electron'),
      args: [path.resolve(__dirname, '../')],
    });
    return this.app.start();
  });

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('起動できること', () => {
    return this.app.isRunning().should.be.true;
  });
});
