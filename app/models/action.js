'use strict';

angular.module('ehrscapeProvisioner.Action', [])

.factory('Action', function($http, $rootScope) {

  function Action(props) {
    this.id = props.id;
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
    this.startTime = 0;
    this.endTime = 0;
  }

  Action.prototype.setUrlParameters = function(params) {
    this.urlParams = params;
  }

  Action.prototype.processHttpResponse = function(result) {
    this.endTime = Date.now();
    this.status = result.status;
    this.responseCode = result.responseCode;
    this.responseBody = result.responseData;
  }

  Action.prototype.performHttpRequest = function(success, failure) {
    this.status = 'Pending';
    this.startTime = Date.now();
    this.endTime = Date.now();
    var _this = this;
    var req = {
      method: this.requestMethod,
      url: this.getFullUrl(),
      headers: this.getHeaders(),
      data: JSON.stringify(postPartyRequestBody)
    };
    return $http(req).
      success(function(data, status, headers, config) {
        _this.processHttpResponse({status: 'Complete', responseCode: status, responseData: data});
        success(data);
      }).
      error(function(data, status, headers, config) {
        _this.processHttpResponse({status: 'Failed', responseCode: status, responseData: data});
        failure(data);
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
      if (this.urlParams[i].config) {
        paramString += this.urlParams[i].name + '=' + $rootScope.ehrscapeConfig[this.urlParams[i].name];
      } else {
        paramString += this.urlParams[i].name + '=' + this.urlParams[i].value;
      }
      if (i < this.urlParams.length-1) {
        paramString += '&';
      }
    }
    return paramString;
  }

  Action.prototype.getHeaders = function() {
    var headers = {};
    if (this.includeSessionHeader) {
      headers['Ehr-Session'] = $rootScope.ehrscapeConfig.sessionId;
    }
    for (var i = 0; i < this.requestHeaders.length; i++) {
      headers[this.requestHeaders[i].name] = this.requestHeaders[i].value;
    }
    return headers;
  }

  Action.prototype.showResults = function() {
    return this.status === 'Failed' || this.status === 'Complete'
  }

  Action.prototype.getStatusClass = function() {
    if (this.status === 'Not started') {
      return 'secondary';
    }
    if (this.status === 'Pending') {
      return '';
    }
    if (this.status === 'Complete') {
      return 'success';
    }
    if (this.status === 'Failed') {
      return 'alert';
    }
  }

  Action.prototype.getFormattedRequestBody = function() {
    if (this.requestBody.length === 0) {
      return '';
    } else {
      return JSON.stringify(this.requestBody, null, 2);
    }
  }

  Action.prototype.getFormattedResponseBody = function() {
    if (this.responseBody.length === 0) {
      return '';
    } else {
      return JSON.stringify(this.responseBody, null, 2);
    }
  }

  Action.prototype.getTimeTaken = function() {
    return this.endTime - this.startTime;
  }

  return Action;

});
