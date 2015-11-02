var express = require('express');
var fs = require('fs');
var request = require('request');
var async = require('async');
var router = express.Router();

var EhrscapeConfig = require('../models/ehrscapeConfig');
var EhrscapeRequest = require('../models/ehrscapeRequest');

router.post('/provision', function(req, res, next) {

  EhrscapeConfig.username = req.body.username;
  EhrscapeConfig.password = req.body.password;
  if (req.body.baseUrl !== undefined) {
    EhrscapeConfig.baseUrl = req.body.baseUrl;
  }

  async.series([getSession, createPatient, createEhr, uploadTemplate, uploadComposition], function(err, results) {
    var overallStatus = err ? 'FAILED' : 'SUCCESSFUL';
    res.json({ status: overallStatus, requests: results, config: EhrscapeConfig });
  });

  function doRequest(desc, options, showRequestBody, onResponse, callback) {
    var startDate = Date.now();
    request.post(options, function(error, response, body) {
      var timeTaken = (Date.now() - startDate) + 'ms';
      onResponse(body);
      var ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
      var err = response.statusCode !== 201 ? true : null;
      callback(err, ehrscapeRequest);
    });
  }

  function getSession(callback) {
    var options = {
      url: EhrscapeConfig.baseUrl + 'session',
      qs: { "username": EhrscapeConfig.username, "password": EhrscapeConfig.password }
    };
    doRequest("Create session", options, true, function(body) {
      var body = JSON.parse(body);
      EhrscapeConfig.sessionId = body.sessionId;
    }, callback);
  }

  function createPatient(callback) {
    var postPartyBody = fs.readFileSync('src/assets/sample_requests/party.json', 'utf8');
    var options = {
      url: EhrscapeConfig.baseUrl + 'demographics/party',
      headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
      body: postPartyBody
    };
    doRequest("Create patient", options, true, function(body) {
      var body = JSON.parse(body);
      var subjectId = body.meta.href;
      EhrscapeConfig.subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
    }, callback);
  }

  function createEhr(callback) {
    var options = {
      url: EhrscapeConfig.baseUrl + 'ehr',
      headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
      qs: { "subjectId": EhrscapeConfig.subjectId, "subjectNamespace": EhrscapeConfig.subjectNamespace, "commiterName": EhrscapeConfig.commiterName }
    };
    doRequest("Create EHR", options, true, function(body) {
      var body = JSON.parse(body);
      EhrscapeConfig.ehrId = body.ehrId;
    }, callback);
  }

  function uploadTemplate(callback) {
    var postTemplateBody = fs.readFileSync('src/assets/sample_requests/vital-signs-template.xml', 'utf8');
    var options = {
      url: EhrscapeConfig.baseUrl + 'template',
      headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
      body: postTemplateBody
    };
    doRequest("Upload template", options, false, function(body) {}, callback);
  }
  
  function uploadComposition(callback) {
    var postCompositionBody = fs.readFileSync('src/assets/sample_requests/vital-signs-composition.json', 'utf8');
    var options = {
      url: EhrscapeConfig.baseUrl + 'composition',
      headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
      body: postCompositionBody,
      qs: { "ehrId": EhrscapeConfig.ehrId, "templateId": EhrscapeConfig.templateId, "format": 'FLAT', "commiterName": EhrscapeConfig.commiterName }
    };
    doRequest("Upload composition", options, true, function(body) {
      var body = JSON.parse(body);
      EhrscapeConfig.compositionId = body.compositionUid;
    }, callback);
  }

});

module.exports = router;
