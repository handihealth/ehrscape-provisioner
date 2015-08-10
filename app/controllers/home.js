'use strict';

angular.module('ehrscapeProvisioner.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home/index.html',
      controller: 'HomeCtrl'
    });
}])

.controller('HomeCtrl', ['$rootScope', '$scope', '$q', '$timeout', 'ehrscapeConfig', 'Action', 'postPartyRequestBody', 'postTemplateRequestBody', 'postCompositionRequestBody', function($rootScope, $scope, $q, $timeout, ehrscapeConfig, Action, postPartyRequestBody, postTemplateRequestBody, postCompositionRequestBody) {

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
    $scope.actionList = prepareActionList(Action);
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

  $scope.generateMarkdownDownloadUrl = function() {
    var params = $rootScope.ehrscapeConfig;
    var url = '/download/workspace-markdown?';
    for (var item in params) {
      url += item + '=' + params[item] + '&';
    }
    return encodeURI(url);
  }

  var prepareActionList = function(Action) {
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
      requestBody: postPartyRequestBody,
      requestBodyType: 'JSON'
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
    actionList.push(new Action({
      id: 'UPLOAD_TEMPLATE',
      name: 'Upload template',
      urlExtension: 'template',
      requestMethod: 'POST',
      requestHeaders: [{name: 'Content-Type', value: 'application/xml'}],
      requestBody: postTemplateRequestBody,
      requestBodyType: 'XML'
    }));
    actionList.push(new Action({
      id: 'UPLOAD_COMPOSITION',
      name: 'Upload composition',
      urlExtension: 'composition',
      requestMethod: 'POST',
      requestHeaders: [{name: 'Content-Type', value: 'application/json'}],
      requestBody: postCompositionRequestBody,
      requestBodyType: 'JSON',
      urlParams: [
        {name: 'ehrId', config: true},
        {name: 'templateId', config: false, value: 'Vital Signs Encounter (Composition)'},
        {name: 'format', config: false, value: 'FLAT'},
        {name: 'commiterName', config: true},
      ]
    }));
    totalActionCount = actionList.length;
    return actionList;
  };

  if (completeActionCount === 0) {
    $scope.reset();
  }

  $scope.postPerformHttpRequest = function(currAction, result) {
    completeActionCount++;
    if (currAction.id === 'LOGIN') {
      $rootScope.ehrscapeConfig.sessionId = result.sessionId;
      $scope.queueFollowingActionHttpRequests();
    }
    if (currAction.id === 'CREATE_PATIENT') {
      var subjectId = result.meta.href;
      subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
      $rootScope.ehrscapeConfig.subjectId = subjectId;
      $rootScope.ehrscapeConfig.fullName = currAction.requestBodyDisplay.firstNames + " " + currAction.requestBodyDisplay.lastNames;
      $rootScope.ehrscapeConfig.nhsNumber = currAction.requestBodyDisplay.partyAdditionalInfo[1].value;
    }
    if (currAction.id === 'CREATE_EHR') {
      $rootScope.ehrscapeConfig.ehrId = result.ehrId;
    }
    if (currAction.id === 'UPLOAD_COMPOSITION') {
      $rootScope.ehrscapeConfig.compositionId = result.compositionUid;
    }
  }

  $scope.queueFollowingActionHttpRequests = function() {

    function createPromise(name, delayIncrement, currAction) {
      var deferred = $q.defer();
      $timeout(function() {
        currAction.performHttpRequest(function(result) {
            $scope.postPerformHttpRequest(currAction, result);
            deferred.resolve(name);
          }, function(result) {
            $scope.postPerformHttpRequest(currAction, result);
            deferred.reject(name);
          }
        );
      }, delayIncrement * 2300);
      return deferred.promise;
    }

    var promises = [];
    for (var i = 1; i < $scope.actionList.length; i++) {
      promises.push(createPromise($scope.actionList[i].id, i, $scope.actionList[i]));
    }
    $q.all(promises);
  }

  var processActionHttpRequests = function() {
    var loginAction = $scope.actionList[0];
    loginAction.performHttpRequest(function(result) {
      $scope.postPerformHttpRequest(loginAction, result);
    }, function(result) {
      completeActionCount++;
      if ($rootScope.ehrscapeConfig.sessionId === '') {
        swal('Error', 'Authentication failed, please check the username and password.');
        return;
      }
    });
  };

}]);
