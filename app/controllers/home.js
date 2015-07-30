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

  prepareActionList = function(Action) {
    var actionList = [];
    actionList.push(new Action({
      id: 'CREATE_PATIENT',
      name: 'Create patient',
      urlExtension: 'demographics/party',
      requestMethod: 'POST',
      requestHeaders: [{name: 'Content-Type', value: 'application/json'}],
      requestBody: postPartyRequestBody
    }));
    actionList.push(new Action({
      id: 'CREATE_EHR',
      name: 'Create EHR',
      urlExtension: 'ehr',
      requestMethod: 'POST'
    }));
    return actionList;
  };

  $rootScope.ehrscapeConfig = ehrscapeConfig;
  $scope.loginAction = new Action({
    id: 'LOGIN',
    name: 'Login',
    urlExtension: 'session',
    requestMethod: 'POST',
    includeSessionHeader: false
  });
  $scope.actionItem = $scope.loginAction;
  $scope.actionList = prepareActionList(Action);

  setLoginResponseData = function(loginAction, result) {
    loginAction.status = result.status;
    loginAction.responseCode = result.responseCode;
    loginAction.responseBody = JSON.stringify(result.responseData, null, 2);
  }

  afterLoginSuccess = function(loginAction, result) {
    setLoginResponseData(loginAction, result);
    $rootScope.ehrscapeConfig.sessionId = result.responseData.sessionId;
    var queue = $queueFactory($scope.actionList.length);

    for (var i = 0; i < $scope.actionList.length; i++) {
      queue.enqueue(function () {
        var currAction = $scope.actionList[i];

        if (currAction.id === 'CREATE_EHR') {
          currAction.setUrlParameters(
            [
              {name: 'subjectId', config: true},
              {name: 'subjectNamespace', config: true},
              {name: 'commiterName', config: true},
            ]
          );
        }

        return currAction.performHttpRequest(function(result) {
          currAction.status = result.status;
          currAction.responseCode = result.responseCode;
          currAction.responseBody = JSON.stringify(result.responseData, null, 2);

          if (currAction.id === 'CREATE_PATIENT') {
            console.log(result.responseData.meta.href);
            var subjectId = result.responseData.meta.href;
            subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
            $rootScope.ehrscapeConfig.subjectId = subjectId;
            console.log(subjectId);
          }

        });
      });
    }
  };

  afterLoginFailure = function (loginAction, result) {
    setLoginResponseData(loginAction, result);
  };

  $scope.start = function() {

    if ($rootScope.ehrscapeConfig.username.length === 0 || $rootScope.ehrscapeConfig.password.length === 0) {
      alert('Please enter username and password');
      return;
    }

    $scope.loginAction.setUrlParameters(
      [
        {name: 'username', config: true},
        {name: 'password', config: true}
      ]
    );
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
