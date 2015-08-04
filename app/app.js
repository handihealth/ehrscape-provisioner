'use strict';

// Declare app level module which depends on views, and components
angular.module('ehrscapeProvisioner', [
  'ngRoute',
  'ngQueue',
  'ehrscapeProvisioner.home',
  'ehrscapeProvisioner.markdown',
  'ehrscapeProvisioner.ehrscapeConfig',
  'ehrscapeProvisioner.Action'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .otherwise({redirectTo: '/'});
}]);
