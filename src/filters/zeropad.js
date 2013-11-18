
/**
 * Zero-pad our time display
 */

function zeroPadFilter(input) {
  if (input !== 0 && !input) {
    return;
  }
  input = input.toString();
  return new Array(2 - input.length + 1).join('0') + input;
}

function wrapper() {
  return zeroPadFilter;
}

angular.module('angular-chrono')
       .filter('zeropad', wrapper);