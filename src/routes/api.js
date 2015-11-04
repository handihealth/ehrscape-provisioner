var express = require('express');
var async = require('async');
var router = express.Router();

var EhrscapeConfig = require('../models/ehrscapeConfig');
var EhrscapeRequest = require('../models/ehrscapeRequest');
var CsvParser = require('../models/csvParser');
var Patient = require('../models/patient');

router.post('/provision/single-patient', function(req, res, next) {

  setConfigFromRequest(req.body);

  async.series([
      EhrscapeRequest.getSession,
      EhrscapeRequest.createPatient,
      EhrscapeRequest.createEhr,
      EhrscapeRequest.uploadTemplate,
      EhrscapeRequest.uploadComposition
    ], function(err, results) {
      var overallStatus = err ? 'FAILED' : 'SUCCESSFUL';
      res.json({ status: overallStatus, requests: results, config: EhrscapeConfig });
    }
  );

});

router.post('/provision/multiple-patient', function(req, masterResponse, next) {

  setConfigFromRequest(req.body);
  var csvParser = new CsvParser('src/assets/data/patients.csv');
  var results = [];

  csvParser.parse(function(patients) {

    EhrscapeRequest.getSession(function(err, res) {
      results.push(res);
      for (var i = 1; i < patients.length; i++) {
        var party = new Patient(patients[i]);
        EhrscapeRequest.createPatientNew(party.toJSON(true), function(err, res) {
          results.push(res);
        });
      };
      masterResponse.json({ status: 'SUCCESSFUL', requests: results, config: EhrscapeConfig });

    });
  });
});

function setConfigFromRequest(requestBody) {
  EhrscapeConfig.username = requestBody.username;
  EhrscapeConfig.password = requestBody.password;
  if (requestBody.baseUrl !== undefined) {
    EhrscapeConfig.baseUrl = requestBody.baseUrl;
  }
}

module.exports = router;
