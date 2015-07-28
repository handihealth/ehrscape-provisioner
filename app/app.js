'use strict';

// Declare app level module which depends on views, and components
angular.module('ehrscapeProvisioner', [
  'ngRoute',
  'ngResource',
  'ehrscapeProvisioner.home'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .otherwise({redirectTo: '/'});
}]);
