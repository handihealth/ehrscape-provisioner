'use strict';

function EhrscapeAction(ehrscapeConfig, props) {
  this.ehrscapeConfig = ehrscapeConfig;
  this.name = props.name;
  this.urlExtension = props.urlExtension;
  this.urlParams = [];
  this.requestMethod = props.requestMethod;
  this.requestBody = '';
  this.responseCode = '';
  this.responseBody = '';
}

EhrscapeAction.prototype.setUrlParameters = function(params) {
  console.log(params);
}