'use strict';

// Declare app level module which depends on views, and components
angular.module('ehrscapeProvisioner', [
  'ngRoute',
  'ehrscapeProvisioner.home',
  'ehrscapeProvisioner.ehrscapeConfig',
  'ehrscapeProvisioner.requestData',
  'ehrscapeProvisioner.Action'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .otherwise({redirectTo: '/'});
}]);
