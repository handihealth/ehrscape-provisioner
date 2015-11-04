var request = require('request');
var fs = require('fs');
var EhrscapeConfig = require('../models/ehrscapeConfig');

var EhrscapeRequest = function(props) {
  this.description = props.description;
  this.method = props.method;
  this.url = props.url;
  this.request = {
    requestBody: props.requestBody,
    timeTaken: props.timeTaken
  }
  this.response = {
    statusCode: props.statusCode,
    responseBody: JSON.stringify(props.responseBody, null, 2)
  }
}

EhrscapeRequest.doRequest = function(desc, options, showRequestBody, onResponse, callback) {
  var startDate = Date.now();
  request.post(options, function(error, response, body) {
    var timeTaken = (Date.now() - startDate) + 'ms';
    onResponse(body);
    var ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
    var err = response.statusCode !== 201 ? true : null;
    callback(err, ehrscapeRequest);
  });
}

EhrscapeRequest.getSession = function(callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'session',
    qs: { "username": EhrscapeConfig.username, "password": EhrscapeConfig.password }
  };
  EhrscapeRequest.doRequest("Create session", options, true, function(body) {
    var body = JSON.parse(body);
    EhrscapeConfig.sessionId = body.sessionId;
  }, callback);
}

EhrscapeRequest.createPatient = function(postPartyBody, callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'demographics/party',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
    body: postPartyBody
  };
  EhrscapeRequest.doRequest("Create patient", options, true, function(body) {
    var body = JSON.parse(body);
    var subjectId = body.meta.href;
    EhrscapeConfig.subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
  }, callback);
}

EhrscapeRequest.createPatientDefault = function(callback) {
  var postPartyBody = fs.readFileSync('src/assets/sample_requests/party.json', 'utf8');
  EhrscapeRequest.createPatient(postPartyBody, callback);
}

EhrscapeRequest.createEhr = function(subjectId, callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'ehr',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
    qs: { "subjectId": subjectId, "subjectNamespace": EhrscapeConfig.subjectNamespace, "commiterName": EhrscapeConfig.commiterName }
  };
  EhrscapeRequest.doRequest("Create EHR", options, true, function(body) {
    var body = JSON.parse(body);
    EhrscapeConfig.ehrId = body.ehrId;
  }, callback);
}

EhrscapeRequest.createEhrDefault = function(callback) {
  EhrscapeRequest.createEhr(EhrscapeConfig.subjectId, callback);
}

EhrscapeRequest.uploadTemplate = function(callback) {
  var postTemplateBody = fs.readFileSync('src/assets/sample_requests/vital-signs-template.xml', 'utf8');
  var options = {
    url: EhrscapeConfig.baseUrl + 'template',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
    body: postTemplateBody
  };
  EhrscapeRequest.doRequest("Upload template", options, false, function(body) {}, callback);
}
  
EhrscapeRequest.uploadComposition = function(callback) {
  var postCompositionBody = fs.readFileSync('src/assets/sample_requests/vital-signs-composition.json', 'utf8');
  var options = {
    url: EhrscapeConfig.baseUrl + 'composition',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
    body: postCompositionBody,
    qs: { "ehrId": EhrscapeConfig.ehrId, "templateId": EhrscapeConfig.templateId, "format": 'FLAT', "commiterName": EhrscapeConfig.commiterName }
  };
  EhrscapeRequest.doRequest("Upload composition", options, true, function(body) {
    var body = JSON.parse(body);
    EhrscapeConfig.compositionId = body.compositionUid;
  }, callback);
}

module.exports = EhrscapeRequest;