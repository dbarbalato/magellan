var magellan = require('../magellan');
var assert = require('assert');
var package_json = require('../package.json');
var bower_json = require('../bower.json');

/* FACTORY */
var x = magellan(123.45)
var y = magellan(54.321)
assert.notDeepEqual(x.coordinate, y.coordinate)

/* IDEMPOTENCY */

// check formatting
assert.equal('123.456700', magellan(123.4567).toDD())
assert.equal('123°27.4020\'', magellan(123.4567).toDM())
assert.equal('123°27\'24.1200"', magellan(123.4567).toDMS())

// must get the same result when coverting between formats consecutively
assert.equal('123.456700', magellan(magellan(123.4567).toDMS()).toDD())
assert.equal('123.456700', magellan(magellan(123.4567).toDM()).toDD())
assert.equal('123°27\'24.1200"W', magellan(magellan(-123.4567).longitude().toDMS()).toDMS())
assert.equal('19°39\'0.0000"E', magellan(19.6500).longitude().toDMS())
assert.equal('19°38\'59.9999"E', magellan(19.64999997).longitude().toDMS())
assert.equal('19°59\'59.9999"E', magellan(19.99999997).longitude().toDMS())
assert.equal('20°0\'0.0000"E', magellan(19.99999999).longitude().toDMS())
assert.equal('12.345600', magellan(magellan(12.3456).toDMS(' ')).toDD())

/* VERSION */

// magellan must correctly expose its version
assert.equal(package_json.version, magellan.version)
assert.equal(bower_json.version, magellan.version)

/* PARSING */

// magellan must correctly expose the coordinate object that it parses
assert.deepEqual({degrees: 12, minutes: 32, seconds: 13.44, direction: 'N'}, magellan('12 32 13.44 N').coordinate)
assert.deepEqual({degrees: -12, minutes: 0, seconds: 0, direction: 'E'}, magellan('-12', 'E').coordinate)
assert.deepEqual({degrees: -12, minutes: 0, seconds: 0}, magellan('-12').coordinate)
assert.deepEqual({}, magellan().coordinate)

// Parse degrees decimal minutes (DD°MM.mmmm)
assert.deepEqual({degrees: 12, minutes: 32, seconds: 31.5, direction: 'N'}, magellan('12°32.525\'N').coordinate)
assert.deepEqual({degrees: 12, minutes: 32, seconds: 31.5, direction: 'N'}, magellan('12 32.525 N').coordinate)

/* VALIDATION */

// latitude must not exceed +/-90 degrees
assert.equal(null, magellan(90.000001).latitude())
assert.equal(null, magellan(-90.1).latitude())
assert.equal(null, magellan('90 01 00').latitude())
assert.equal(null, magellan('90 00 00.1').latitude())
assert.equal(null, magellan('90°00\'0.0001"').latitude())
assert.equal(null, magellan('91°00\'00"').latitude())

// latitude must be north or south and not east or west
assert.notEqual(null, magellan('N89°12\'15.456"').latitude())
assert.notEqual(null, magellan('S89°12\'15.456"').latitude())
assert.equal(null, magellan('89°12\'15.456" E').latitude())
assert.equal(null, magellan('89°12\'15.456" W').latitude())

// longitude must not exceed +/-180 degrees
assert.equal(null, magellan(180.000001).longitude())
assert.equal(null, magellan(-180.1).longitude())
assert.equal(null, magellan('180 01 00').longitude())
assert.equal(null, magellan('180 00 00.1').longitude())
assert.equal(null, magellan('180°00\'0.0001"').longitude())
assert.equal(null, magellan('181°00\'00"').longitude())

// longitude must be east or west and not north or south
assert.notEqual(null, magellan('89°12\'15.456"E').longitude())
assert.notEqual(null, magellan('89°12\'15.456"W').longitude())
assert.equal(null, magellan('89°12\'15.456"S').longitude())
assert.equal(null, magellan('89°12\'15.456"N').longitude())

/* COMPARISON */
var x = magellan(123.456).longitude()
var y = magellan(54.321).latitude()
var z = magellan('123°27\'21.6000"E')

// equals self
assert.equal(true, x.equals(x))
assert.equal(true, y.equals(y))
assert.equal(true, z.equals(z))
assert.equal(true, magellan(123).equals(magellan(123)))

// identifies equality
assert.equal(true, x.equals(z))
assert.equal(true, z.equals(x))

// identifies inequality
assert.equal(false, x.equals(y))
assert.equal(false, y.equals(x))
assert.equal(false, magellan(123).equals(magellan(-123)))


/* FORMATTING */

assert.equal('123°q27\'q21.6000"qE', magellan(123.456, 'E').toDMS('q'))
assert.equal('123°27\'21.6000"E', magellan(123.456).longitude().toDMS())
assert.equal('123.456000', magellan('123°27\'21.6"E').toDD())
assert.equal('123.456000', magellan('123°27\'21.6"').longitude().toDD())
assert.equal('-123.000000', magellan(-123).toDD())
assert.equal('123°27\'21.6000"W', magellan(-123.456).longitude().toDMS())
assert.equal('12.300000', magellan(12.3).toDD())
assert.equal('12° 20\' 44.1600" S', magellan(-12.3456).latitude().toDMS(' '))


/* BUGFIX for CASE #4: Longitude parsing and validation fails in specific cases */
assert.notEqual(null, magellan(-120.1).longitude(), 'Fails with BUG described in CASE#4');

/* BUGFIX for CASE #7: Lats & Longs less than +1 minute are in the wrong direction */
assert.equal('N', magellan(0.1).latitude().coordinate.direction);
assert.equal('E', magellan(0.1).longitude().coordinate.direction);
