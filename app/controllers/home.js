'use strict';

angular.module('ehrscapeProvisioner.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home/index.html',
      controller: 'HomeCtrl'
    });
}])

.controller('HomeCtrl', ['$rootScope', '$scope', '$http', 'ehrscapeConfig', 'Action', function($rootScope, $scope, $http, ehrscapeConfig, Action) {
  $rootScope.ehrscapeConfig = ehrscapeConfig;
  $scope.actionList = prepareActionList(Action);

  $scope.start = function() {
    for (var i = 0; i < $scope.actionList.length; i++) {
      $scope.actionList[i].performHttpRequest();
    }
  };

}]);

function prepareActionList(Action) {
  var actionList = [];
  actionList.push(new Action({
    name: 'Login',
    urlExtension: 'session',
    requestMethod: 'POST'
  }));
  return actionList;
}