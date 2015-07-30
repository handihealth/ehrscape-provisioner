'use strict';

angular.module('ehrscapeProvisioner.Action', [])

.factory('Action', function($http, $rootScope) {

  function Action(props) {
    this.name = props.name;
    this.urlExtension = props.urlExtension;
    this.urlParams = [];
    this.includeSessionHeader = props.includeSessionHeader == undefined ? true : props.includeSessionHeader;
    this.requestMethod = props.requestMethod;
    this.requestHeaders = props.requestHeaders == undefined ? [] : props.requestHeaders;
    this.requestBody = props.requestBody == undefined ? '' : props.requestBody;
    this.responseCode = '';
    this.responseBody = '';
    this.status = 'Not started';
  }

  Action.prototype.setUrlParameters = function(params) {
    this.urlParams = params;
  }

  Action.prototype.performHttpRequest = function(success, failure) {
    this.status = 'Pending';
    var req = {
      method: this.requestMethod,
      url: this.getFullUrl(),
      headers: this.getHeaders(),
      data: JSON.stringify(postPartyRequestBody)
    };
    return $http(req).
      success(function(data, status, headers, config) {
        success({status: 'Complete', sessionId: data.sessionId});
      }).
      error(function(data, status, headers, config) {
        failure({status: 'Failed'});
      });
  }

  Action.prototype.getFullUrl = function() {
    return $rootScope.ehrscapeConfig.baseUrl + this.urlExtension + this.constructUrlParameters();
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

  Action.prototype.getHeaders = function() {
    headers = {};
    if (this.includeSessionHeader) {
      headers['Ehr-Session'] = $rootScope.ehrscapeConfig.sessionId;
    }
    for (var i = 0; i < this.requestHeaders.length; i++) {
      headers[this.requestHeaders[i].name] = this.requestHeaders[i].value;
    }
    return headers;
  }

  return Action;

});
