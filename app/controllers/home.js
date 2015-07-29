'use strict';

angular.module('ehrscapeProvisioner.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home/index.html',
      controller: 'HomeCtrl'
    });
}])

.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.ehrscapeDetails = new EhrscapeConfig();
  $scope.actionList = prepareActionList($scope.ehrscapeDetails);

  $scope.start = function() {
    console.log($scope.ehrscapeDetails);
    console.log($scope.actionList);

    $http.post('https://rest.ehrscape.com/rest/v1/session?username=c4h_across&password=CABERMAl', {}).
      success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        console.log(data);
        $scope.ehrscapeDetails.sessionId = data.sessionId;
        console.log(status);
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log(data);
        console.log(status);
      });
    };

}]);

function prepareActionList(ehrscpaeConfig) {
  var actionList = [];
  actionList.push(new EhrscapeAction(ehrscpaeConfig, {
    name: 'Login',
    urlExtension: 'session',
    requestMethod: 'POST'
  }));
  return actionList;
}