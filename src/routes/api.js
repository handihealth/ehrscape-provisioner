var express = require('express');
var fs = require('fs');
var request = require('request');
var async = require('async');
var router = express.Router();

var EhrscapeConfig = require('../models/ehrscapeConfig');

router.post('/provision', function(req, res, next) {

  EhrscapeConfig.username = req.body.username;
  EhrscapeConfig.password = req.body.password;
  if (req.body.baseUrl !== undefined) {
    EhrscapeConfig.baseUrl = req.body.baseUrl;
  }

  async.series([getSession, createPatient, createEhr, uploadTemplate, uploadComposition], function() {
    res.json(EhrscapeConfig);
  });

  function getSession(callback) {
    console.log('1');
    var options = {
      url: EhrscapeConfig.baseUrl + 'session',
      qs: {
        "username": EhrscapeConfig.username,
        "password": EhrscapeConfig.password
      }
    };
    request.post(options, function(error, response, body) {
      var body = JSON.parse(body);
      EhrscapeConfig.sessionId = body.sessionId;
      callback(null, 'one');
    });
  }

  function createPatient(callback) {
    console.log('2');
    var postPartyBody = fs.readFileSync('src/assets/sample_requests/party.json', 'utf8');
    var options = {
      url: EhrscapeConfig.baseUrl + 'demographics/party',
      headers: {
        'Ehr-Session': EhrscapeConfig.sessionId,
        'Content-Type': 'application/json'
      },
      body: postPartyBody
    };
    request.post(options, function(error, response, body) {
      var body = JSON.parse(body);
      var subjectId = body.meta.href;
      subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
      EhrscapeConfig.subjectId = subjectId;
      callback(null, 'two');
    });
  }

  function createEhr(callback) {
    console.log('3');
    var options = {
      url: EhrscapeConfig.baseUrl + 'ehr',
      headers: {
        'Ehr-Session': EhrscapeConfig.sessionId
      },
      qs: {
        "subjectId": EhrscapeConfig.subjectId,
        "subjectNamespace": EhrscapeConfig.subjectNamespace,
        "commiterName": EhrscapeConfig.commiterName
      }
    };
    request.post(options, function(error, response, body) {
      var body = JSON.parse(body);
      EhrscapeConfig.ehrId = body.ehrId;
      callback(null, 'three');
    });
  }

  function uploadTemplate(callback) {
    console.log('4');
    var postTemplateBody = fs.readFileSync('src/assets/sample_requests/vital-signs-template.xml', 'utf8');
    var options = {
      url: EhrscapeConfig.baseUrl + 'template',
      headers: {
        'Ehr-Session': EhrscapeConfig.sessionId
      },
      body: postTemplateBody
    };
    request.post(options, function(error, response, body) {
      callback(null, 'four');
    });
  }
  
  function uploadComposition(callback) {
    console.log('5');
    var postCompositionBody = fs.readFileSync('src/assets/sample_requests/vital-signs-composition.json', 'utf8');
    var options = {
      url: EhrscapeConfig.baseUrl + 'composition',
      headers: {
        'Ehr-Session': EhrscapeConfig.sessionId,
        'Content-Type': 'application/json'
      },
      body: postCompositionBody,
      qs: {
        "ehrId": EhrscapeConfig.ehrId,
        "templateId": EhrscapeConfig.templateId,
        "format": 'FLAT',
        "commiterName": EhrscapeConfig.commiterName
      }
    };
    request.post(options, function(error, response, body) {
      var body = JSON.parse(body);
      EhrscapeConfig.compositionId = body.compositionUid;
      callback(null, 'five');
    });
  }

});

module.exports = router;
