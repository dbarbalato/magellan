var magellan = require('../magellan').magellan

console.log(magellan)

module.exports = {
    'test itempotency': function(beforeExit, assert) {
      assert.equal('123.4560', magellan(magellan(123.456).toDMS()).toDD());
    }
};