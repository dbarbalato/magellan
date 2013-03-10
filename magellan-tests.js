var magellan = require('../magellan')

module.exports = {
    'test itempotency': function(beforeExit, assert) {
      assert.equal('123.456', magellan(magellan(123.456).toDMS()).toDD());
    }
};