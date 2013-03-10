// Magellan version 1.0
// Provided by Dave Barbalato - https://github.com/dbarbalato/
// Distributable under the MIT License
;(function() {

    // Version identifier
    var VERSION = '1.0';

    // Compass direction constants
    var NORTH = 'N';
    var SOUTH = 'S';
    var EAST = 'E';
    var WEST = 'W';

    // Signed degree format (e.g. -123.45)
    var DD_FORMAT_REGEX = /^([+-]?\d{1,3})(.\d+)?$/

    // Degrees minutes seconds format (e.g. 12°34'56" N or N12°34'56.123" )
    var DMS_FORMAT_REGEX = /^[NSEW]?\s*(\d{1,3})°?\s*(?:(\d{1,2})'?\s*(?:(\d{1,2}(?:.\d+)?)"?\s*)?)?\s*[NSEW]?$/
    
    // Magellan base function
    function magellan() {

        var coordinate = {};

        // Handle function call when magellan( '-123', '45', '59' ) or similar
        if (arguments.length >= 3) {
            coordinate.degrees = parseInt(arguments[0]);
            coordinate.minutes = parseInt(arguments[1]);
            coordinate.seconds = parseFloat(arguments[2]);
        }

        // Handle function call when magellan(' 123°45'59" N ')
        else if (arguments.length >= 1 && typeof arguments[0] == 'string') {
            var matches;

            //  Attempt to match against Decimal Degrees format
            if ((matches = arguments[0].match(DD_FORMAT_REGEX)) != null) {
                coordinate.degrees = parseInt(matches[1])

                var decimal = parseFloat(matches[2]) || 0.0;
                coordinate.minutes = parseInt(decimal * 60);
                coordinate.seconds = parseFloat(((decimal * 60) - coordinate.minutes) * 60);

            // Attempt to match against Degrees Minutes Seconds format
            } else if ((matches = arguments[0].match(DMS_FORMAT_REGEX)) != null) {
                coordinate.degrees = parseInt(matches[1]);
                coordinate.minutes = parseInt(matches[2])|| 0;
                coordinate.seconds = parseFloat(matches[3]) || 0.0;
            }
        } 
        
        // Handle function call when magellan( 123.4567 ) or similar
        else if (arguments.length >= 1 && typeof arguments[0] == 'number') {

            // Degrees is the integer portion of the input
            coordinate.degrees = parseInt(arguments[0]);
            
            var decimal = Math.abs(parseFloat(arguments[0]) - coordinate.degrees);
            coordinate.minutes = parseInt(decimal * 60);
            coordinate.seconds = parseFloat(((decimal * 60) - coordinate.minutes) * 60);
        } 

        // Attempt to determine the direction if it was supplied
        if (typeof arguments[arguments.length - 1] === 'string') {
            var direction = arguments[arguments.length - 1].toUpperCase().match(/[NSEW]/);
            if (direction) coordinate.direction = direction[0];
        }

        // Format the current coordinate as Degrees Decimal
        magellan.toDD = function() {
            var decimal = coordinate.minutes / 60 + coordinate.seconds / 3600;

            var formatted;
            if (coordinate.degrees > 0) formatted = (coordinate.degrees + decimal)
            else formatted = (coordinate.degrees - decimal)
            
            // Limit the precision to 4 decimal places
            formatted = formatted.toFixed(4);

            if (coordinate.direction
                    && (coordinate.direction == SOUTH || coordinate.direction == WEST))
                    formatted = '-' + formatted;
            return formatted;
        }

        // Format the current coordinate as Degrees Minutes Seconds
        // Optionally join components on a seperator by providing a string argument
        magellan.toDMS = function(seperator) {
            var components = [
                Math.abs(coordinate.degrees) + '°',
                coordinate.minutes + '\'',
                coordinate.seconds.toFixed(4) + '"',
                (coordinate.direction ? coordinate.direction : '')
            ];
            return typeof seperator === 'string' ? components.join(seperator) : components.join('')
        }

        // Validate the current coordinate as latitude
        magellan.latitude = function() {
            // Coordinate is valid latitude if it exists and is between +/- 90
            if (coordinate && Math.abs(coordinate.degrees) <= 90
                    // and if it is equal to +/- 90, minutes and seconds are both 0
                    && (Math.abs(coordinate.degrees) != 90 || (coordinate.minutes == 0 && coordinate.seconds == 0.0))
                    // and the minutes and seconds are both less than 60
                    && (coordinate.minutes < 60 && coordinate.seconds < 60)
                    // and if the coordinate direction is present, it is North or South
                    && (!coordinate.direction || coordinate.direction == NORTH || coordinate.direction == SOUTH)) {

                    // In the event coordinate direction is null, we can automatically infer it
                    // using the value of the degrees
                    if (!coordinate.direction) coordinate.direction = coordinate.degrees > 0 ? NORTH : SOUTH

                    // Enable method chaining
                    return magellan;
            }

            // In the event of a failure, break the chain, throwing an error
            return null;
        }

        // Validate the current coordinate as longitude
        magellan.longitude = function() {

            // Coordinate is valid longitude if it exists and is between +/- 180
            if (coordinate && Math.abs(coordinate.degrees) <= 180
                    // and if it is equal to +/- 180, minutes and seconds are both 0
                    && (Math.abs(coordinate.degrees) != 180 || (coordinate.minutes == 0 && coordinate.seconds == 0.0))
                    // and the minutes and seconds are both less than 60
                    && (coordinate.minutes < 60 && coordinate.seconds < 60)
                    // and if the coordinate direction is present, it is East or West
                    && (!coordinate.direction || coordinate.direction == EAST || coordinate.direction == WEST)) {

                    // In the event coordinate direction is null, we can automatically infer it
                    // using the value of the degrees
                    if (!coordinate.direction) coordinate.direction = coordinate.degrees > 0 ? EAST : WEST

                    // Enable method chaining
                    return magellan;
            }

            // In the event of a failure, break the chain, throwing an error
            return null;
        }

        // Enable method chaining
        return magellan;

    }

    // Expose the version
    magellan.version = 'Version ' + VERSION;

    // Publish the library, either as an AMD module or to the window
    if (typeof define === 'function' && define.amd) {
        define('magellan', function() {
            return magellan;
        });
    } else if(typeof require === 'function' && typeof exports === 'object') {
        exports.magellan = magellan;
    } else {
        window.magellan = magellan;
    }
})();
