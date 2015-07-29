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

    if ($rootScope.ehrscapeConfig.username.length === 0 || $rootScope.ehrscapeConfig.password.length === 0) {
      alert('Please enter username and password');
      return;
    }

    $scope.actionList[0].setUrlParameters([{name: 'username', value: $rootScope.ehrscapeConfig.username}, {name: 'password', value: $rootScope.ehrscapeConfig.password}]);

    for (var i = 0; i < $scope.actionList.length; i++) {
      var currAction = $scope.actionList[i];
      currAction.performHttpRequest(function(result) {
        currAction.status = result.status;
        $rootScope.ehrscapeConfig.sessionId = result.sessionId;
      });
    }
  };

  $scope.reset = function() {
    $scope.actionList = prepareActionList(Action);
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