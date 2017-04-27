'use strict';

/* Filters */

angular.module('sensdash.filters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
});
