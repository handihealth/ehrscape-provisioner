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
      res.json({ status: overallStatus, numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
    }
  );

});

router.post('/provision/multiple-patient', function(req, masterResponse, next) {

  setConfigFromRequest(req.body);
  var csvParser = new CsvParser('src/assets/data/' + EhrscapeConfig.patientsFile);
  var problemTemplateNumCycle = new NumberCycle(1, 3, [[1,2,3,4,5,6], [1,2,3,4], [1,2,3,4,5]]);
  var orderTemplateNumCycle = new NumberCycle(1, 12, []);
  var results = [];

  csvParser.parse(function(patients) {
    EhrscapeRequest.getSession(function(err, res) {
      results.push(res);
      if (err) {
        masterResponse.json({ status: 'FAILED', numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
        return;
      }

      EhrscapeRequest.uploadTemplate('Problems', 'src/assets/sample_requests/problems/problems-template.xml', function(err, res) {
        results.push(res);
        if (err) {
          masterResponse.json({ status: 'FAILED', numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
          return;
        }

        EhrscapeRequest.uploadTemplate('Orders', 'src/assets/sample_requests/orders/orders-template.xml', function(err, res) {
          results.push(res);
          if (err) {
            masterResponse.json({ status: 'FAILED', numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
            return;
          }

          var patientError = false;
          var patientsToLoad = patients.length - 1;
          for (var i = 1; i < patients.length; i++) {
            var party = new Patient(patients[i]);
            EhrscapeRequest.createPatientAndEhr(party, orderTemplateNumCycle, problemTemplateNumCycle, function(err, res, ehrId, party) {
              results = results.concat(res);
              patientsToLoad -= 1;
              if (err) {
                console.log('patientError found. ' + party.getFullName());
                patientError = true;
              } else {
                console.log('patientsToLoad = ' + patientsToLoad);
                if (patientsToLoad === 0) {
                  if (!patientError) {
                    console.log('no errors found.');
                    EhrscapeRequest.uploadTemplate('Vital signs', 'src/assets/sample_requests/vital-signs/vital-signs-template.xml', function(err, res) {
                      results.push(res);
                      if (err) {
                        masterResponse.json({ status: 'FAILED', numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
                      } else {
                        EhrscapeRequest.importCsv('src/assets/data/nursing-obs.csv', function(err, res) {
                          results.push(res);
                          var overallStatus = err ? 'FAILED' : 'SUCCESSFUL';
                          masterResponse.json({ status: overallStatus, numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
                        });
                      }
                    });
                  } else {
                    console.log('errors found.');
                    masterResponse.json({ status: 'FAILED', numberOfRequests: results.length, requests: results, config: EhrscapeConfig });
                  }
                }
              }
            });
          };

        });

      });
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
  if (requestBody.patientsFile !== undefined) {
    EhrscapeConfig.patientsFile = requestBody.patientsFile;
  }
}

module.exports = router;
