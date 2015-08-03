'use strict';

angular.module('ehrscapeProvisioner.markdown', ['ngRoute'])

.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
  $routeProvider
    .when('/markdown', {
      templateUrl: '/app/views/markdown/index.html',
      controller: 'MarkdownCtrl'
    });
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}])

.controller('MarkdownCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {

  $scope.fullName = postPartyRequestBody.firstNames + " " + postPartyRequestBody.lastNames;

  // var content = 'file content for example';
  // var blob = new Blob([ content ], { type : 'text/plain' });
  // $scope.url = (window.URL || window.webkitURL).createObjectURL( blob );

}]);
