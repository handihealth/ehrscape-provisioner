'use strict';

angular.module('ehrscapeProvisioner.home', ['ngRoute', 'ngQueue'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home/index.html',
      controller: 'HomeCtrl'
    });
}])

.controller('HomeCtrl', ['$rootScope', '$scope', '$http', '$queueFactory', 'ehrscapeConfig', 'Action', function($rootScope, $scope, $http, $queueFactory, ehrscapeConfig, Action) {

  $rootScope.ehrscapeConfig = ehrscapeConfig;
  $scope.loginAction = new Action({
    name: 'Login',
    urlExtension: 'session',
    requestMethod: 'POST',
    includeSessionHeader: false
  });
  $scope.actionList = prepareActionList(Action);

  afterLoginSuccess = function(loginAction, result) {
    loginAction.status = result.status;
    $rootScope.ehrscapeConfig.sessionId = result.sessionId;
    var queue = $queueFactory($scope.actionList.length);

    for (var i = 0; i < $scope.actionList.length; i++) {
      queue.enqueue(function () {
        var currAction = $scope.actionList[i];
        return currAction.performHttpRequest(function(result) {
          currAction.status = result.status;
        });
      });
    }
  }

  afterLoginFailure = function (loginAction, result) {
    loginAction.status = result.status;
  }

  $scope.start = function() {

    if ($rootScope.ehrscapeConfig.username.length === 0 || $rootScope.ehrscapeConfig.password.length === 0) {
      alert('Please enter username and password');
      return;
    }

    $scope.loginAction.setUrlParameters([{name: 'username', value: $rootScope.ehrscapeConfig.username}, {name: 'password', value: $rootScope.ehrscapeConfig.password}]);
    var loginAction = $scope.loginAction;

    loginAction.performHttpRequest(
      function(result) {
        afterLoginSuccess(loginAction, result)
      },
      function(result) {
        afterLoginFailure(loginAction, result)
      }
    );

  };

  $scope.reset = function() {
    $scope.actionList = prepareActionList(Action);
  };

}]);

function prepareActionList(Action) {
  var actionList = [];
  actionList.push(new Action({
    name: 'Create patient',
    urlExtension: 'demographics/party',
    requestMethod: 'POST',
    requestHeaders: [{name: 'Content-Type', value: 'application/json'}],
    requestBody: postPartyRequestBody
  }));
  return actionList;
}