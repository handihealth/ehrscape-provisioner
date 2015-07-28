'use strict';

angular.module('ehrscapeProvisioner.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home/index.html',
      controller: 'HomeCtrl'
    });
}])

.controller('HomeCtrl', [function() {

}]);