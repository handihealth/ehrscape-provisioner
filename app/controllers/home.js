'use strict';

angular.module('ehrscapeProvisioner.home', ['ngRoute', 'ngQueue'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home/index.html',
      controller: 'HomeCtrl'
    });
}])

.controller('HomeCtrl', ['$rootScope', '$scope', '$queueFactory', 'ehrscapeConfig', 'Action', function($rootScope, $scope, $queueFactory, ehrscapeConfig, Action) {

  var totalActionCount = 0;
  var completeActionCount = 0;

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
    $scope.actionList = $scope.prepareActionList(Action);
    this.completeActionCount = 0;
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

  $scope.prepareActionList = function(Action) {
    var actionList = [];
    actionList.push(new Action({
      id: 'LOGIN',
      name: 'Login',
      urlExtension: 'session',
      requestMethod: 'POST',
      includeSessionHeader: false,
      urlParams: [
        {name: 'username', config: true},
        {name: 'password', config: true}
      ]
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
      requestMethod: 'POST',
      urlParams: [
        {name: 'subjectId', config: true},
        {name: 'subjectNamespace', config: true},
        {name: 'commiterName', config: true},
      ]
    }));
    totalActionCount = actionList.length;
    return actionList;
  };

  if (completeActionCount === 0) {
    $scope.reset();
  }

  var postPerformHttpRequest = function(currAction, result) {
    completeActionCount++;
    if (currAction.id === 'LOGIN') {
      $rootScope.ehrscapeConfig.sessionId = result.sessionId;
      queueFollowingActionHttpRequests();
    }
    if (currAction.id === 'CREATE_PATIENT') {
      var subjectId = result.meta.href;
      subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
      $rootScope.ehrscapeConfig.subjectId = subjectId;
    }
    if (currAction.id === 'CREATE_EHR') {
      $rootScope.ehrscapeConfig.ehrId = result.ehrId;
    }
  }

  var queueFollowingActionHttpRequests = function() {
    var queue = $queueFactory($scope.actionList.length-1);
    for (var i = 1; i < $scope.actionList.length; i++) {
      queue.enqueue(function () {
        var currAction = $scope.actionList[i];
        return currAction.performHttpRequest(function(result) {
            postPerformHttpRequest(currAction, result);
          }, function(result) {
            postPerformHttpRequest(currAction, result);
          }
        );
      });
    }
  }

  var processActionHttpRequests = function() {
    var loginAction = $scope.actionList[0];
    loginAction.performHttpRequest(function(result) {
      postPerformHttpRequest(loginAction, result);
    }, function(result) {
      if ($rootScope.ehrscapeConfig.sessionId === '') {
        swal('Error', 'Authentication failed, please check the username and password.');
        return;
      }
    });
  };

}]);
