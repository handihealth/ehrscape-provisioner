var express = require('express');
var async = require('async');
var router = express.Router();

var EhrscapeConfig = require('../models/ehrscapeConfig');
var EhrscapeRequest = require('../models/ehrscapeRequest');
var NumberCycle = require('../models/numberCycle');
var CsvParser = require('../models/csvParser');
var Patient = require('../models/patient');

router.post('/provision/single-patient', function(req, res, next) {

  setConfigFromRequest(req.body);

  async.series([
      EhrscapeRequest.getSession,
      EhrscapeRequest.createPatientDefault,
      EhrscapeRequest.createEhrDefault,
      EhrscapeRequest.uploadTemplateDefault,
      EhrscapeRequest.uploadCompositionDefault
    ], function(err, results) {
      var overallStatus = err ? 'FAILED' : 'SUCCESSFUL';
      res.json({ status: overallStatus, requests: results, config: EhrscapeConfig });
    }
  );

});

router.post('/provision/multiple-patient', function(req, masterResponse, next) {

  setConfigFromRequest(req.body);
  var csvParser = new CsvParser('src/assets/data/patients.csv');
  var problemTemplateNumCycle = new NumberCycle(1, 3);
  var results = [];

  csvParser.parse(function(patients) {

    EhrscapeRequest.getSession(function(err, res) {
      results.push(res);

      // TODO: make sure this is loaded first
      EhrscapeRequest.uploadTemplate('Problems', 'src/assets/sample_requests/problems-template.xml', function(err, res) {
        results.push(res);
      });
      var patientsToLoad = 2;
      for (var i = 1; i < 3; i++) {
        var party = new Patient(patients[i]);
        EhrscapeRequest.createPatientAndEhr(party, function(res, ehrId) {
          results = results.concat(res);
          patientsToLoad -= 1;
          var templateNum = problemTemplateNumCycle.get();
          
          EhrscapeRequest.uploadComposition('Problems ' + templateNum, 'src/assets/sample_requests/problems-composition-' + templateNum + '.json', ehrId, 'IDCR Problem List.v1', function(err, res) {
            results.push(res);
          });

          if (patientsToLoad === 0) {

            EhrscapeRequest.uploadTemplate('Vital signs', 'src/assets/sample_requests/vital-signs-template.xml', function(err, res) {
              results.push(res);
              EhrscapeRequest.importCsv('src/assets/data/nursing-obs.csv', function(err, res) {
                results.push(res);
                masterResponse.json({ status: 'SUCCESSFUL', requests: results, config: EhrscapeConfig });
              });
            });

          }
        });
      };
    });
  });
});

function setConfigFromRequest(requestBody) {
  EhrscapeConfig.username = requestBody.username;
  EhrscapeConfig.password = requestBody.password;
  if (requestBody.baseUrl !== undefined) {
    EhrscapeConfig.baseUrl = requestBody.baseUrl;
  }
  if (requestBody.subjectNamespace !== undefined) {
    EhrscapeConfig.subjectNamespace = requestBody.subjectNamespace;
  }
}

module.exports = router;
