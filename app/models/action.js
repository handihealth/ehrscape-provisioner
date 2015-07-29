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
    this.status = 'Not started';
  }

  Action.prototype.setUrlParameters = function(params) {
    this.urlParams = params;
  }

  Action.prototype.performHttpRequest = function(callback) {
    this.status = 'Pending';
    if (this.requestMethod === 'POST') {
      this.performHttpPost(callback);
    }
    if (this.requestMethod === 'GET') {
      performHttpGet();
    }
  }

  Action.prototype.getFullUrl = function() {
    return $rootScope.ehrscapeConfig.baseUrl + this.urlExtension + this.constructUrlParameters(); // + '    ?username=c4h_across&password=CABERMAl';
  }

  Action.prototype.constructUrlParameters = function() {
    var paramString = '';
    if (this.urlParams.length > 0) {
      paramString += '?';
    }
    for (var i = 0; i < this.urlParams.length; i++) {
      paramString += this.urlParams[i].name + '=' + this.urlParams[i].value + '&';
    }
    return paramString;
  }

  Action.prototype.performHttpPost = function(callback) {
    $http.post(this.getFullUrl(), {}).
      success(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
        callback({status: 'Complete', sessionId: data.sessionId});
      }).
      error(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
        callback({status: 'Failed'});
      });
  }

  function performHttpGet() {

  }

  return Action;

});
