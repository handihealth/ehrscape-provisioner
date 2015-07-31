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

  totalActionCount = 3;
  completeActionCount = 0;

  prepareActionList = function(Action) {
    var actionList = [];
    actionList.push(new Action({
      id: 'LOGIN',
      name: 'Login',
      urlExtension: 'session',
      requestMethod: 'POST',
      includeSessionHeader: false
    }));
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

  setResponseData = function(actionItem, result) {
    actionItem.endTime = Date.now();
    actionItem.status = result.status;
    actionItem.responseCode = result.responseCode;
    actionItem.responseBody = JSON.stringify(result.responseData, null, 2);
    completeActionCount++;
  }

  prePerformHttpRequest = function(currAction) {
    if (currAction.id === 'LOGIN') {
      currAction.setUrlParameters(
        [
          {name: 'username', config: true},
          {name: 'password', config: true}
        ]
      );
    }
    if (currAction.id === 'CREATE_EHR') {
      currAction.setUrlParameters(
        [
          {name: 'subjectId', config: true},
          {name: 'subjectNamespace', config: true},
          {name: 'commiterName', config: true},
        ]
      );
    }
  }

  postPerformHttpRequest = function(currAction, result) {
    if (currAction.id === 'CREATE_PATIENT') {
      var subjectId = result.responseData.meta.href;
      subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
      $rootScope.ehrscapeConfig.subjectId = subjectId;
    }
  }

  queueFollowingActionHttpRequests = function() {
    var queue = $queueFactory($scope.actionList.length-1);
    for (var i = 1; i < $scope.actionList.length; i++) {
      queue.enqueue(function () {
        var currAction = $scope.actionList[i];
        prePerformHttpRequest(currAction);
        return currAction.performHttpRequest(function(result) {
            setResponseData(currAction, result);
            postPerformHttpRequest(currAction, result);
          }, function(result) {
            setResponseData(currAction, result);
            //TODO: if any requests fail then probably don't do the rest.
          }
        );
      });
    }
  }

  processActionHttpRequests = function() {
    var loginAction = $scope.actionList[0];
    loginAction.setUrlParameters(
      [
        {name: 'username', config: true},
        {name: 'password', config: true}
      ]
    );
    loginAction.performHttpRequest(function(result) {
      setResponseData(loginAction, result);
      $rootScope.ehrscapeConfig.sessionId = result.responseData.sessionId;
      queueFollowingActionHttpRequests();
    }, function(result) {
      setResponseData(loginAction, result);
      if ($rootScope.ehrscapeConfig.sessionId === '') {
        swal('Error', 'Authentication failed, please check the username and password.');
        return;
      }
    });
  };

  $scope.start = function() {
    completeActionCount = 0;
    if ($rootScope.ehrscapeConfig.username.length === 0 || $rootScope.ehrscapeConfig.password.length === 0) {
      swal('Error', 'Please enter username and password');
      return;
    }
    processActionHttpRequests();
  };

  $scope.reset = function() {
    $rootScope.ehrscapeConfig = ehrscapeConfig;
    $scope.actionList = prepareActionList(Action);
    completeActionCount = 0;
  };

  $scope.getPercentComplete = function() {
    return (completeActionCount / totalActionCount * 100) + '%';
  }

  $scope.getTotalTimeTaken = function() {
    var totalTime = 0;
    for (var i = 0; i < $scope.actionList.length; i++) {
      totalTime += $scope.actionList[i].getTimeTaken();
    }
    return totalTime;
  }

  $scope.showTotalProgressAndTime = function() {
    return $scope.actionList[0].status === 'Complete' || $scope.actionList[0].status === 'Failed';
  }

  $scope.reset();

}]);
