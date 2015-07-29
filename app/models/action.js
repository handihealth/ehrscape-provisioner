'use strict';

angular.module('ehrscapeProvisioner.Action', [])

.factory('Action', function($http, $rootScope) {

  function Action(props) {
    this.name = props.name;
    this.urlExtension = props.urlExtension;
    this.urlParams = [];
    this.requestMethod = props.requestMethod;
    this.requestBody = '';
    this.responseCode = '';
    this.responseBody = '';
  }

  Action.prototype.setUrlParameters = function(params) {
    console.log(params);
  }

  Action.prototype.performHttpRequest = function() {
    if (this.requestMethod === 'POST') {
      performHttpPost();
    }
    if (this.requestMethod === 'GET') {
      performHttpGet();
    }
  }

  function performHttpPost() {
    $http.post('https://rest.ehrscape.com/rest/v1/session?username=c4h_across&password=CABERMAl', {}).
      success(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
        $rootScope.ehrscapeConfig.sessionId = data.sessionId;
      }).
      error(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
      });
  }

  function performHttpGet() {
    
  }

  return Action;

});
