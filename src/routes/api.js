var express = require('express');
var async = require('async');
var router = express.Router();

var EhrscapeConfig = require('../models/ehrscapeConfig');
var EhrscapeRequest = require('../models/ehrscapeRequest');
var CsvParser = require('../models/csvParser');
var Patient = require('../models/patient');

router.post('/provision/single-patient', function(req, res, next) {

  EhrscapeConfig.username = req.body.username;
  EhrscapeConfig.password = req.body.password;
  if (req.body.baseUrl !== undefined) {
    EhrscapeConfig.baseUrl = req.body.baseUrl;
  }

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

router.post('/provision/multiple-patient', function(req, res, next) {

  EhrscapeConfig.username = req.body.username;
  EhrscapeConfig.password = req.body.password;
  if (req.body.baseUrl !== undefined) {
    EhrscapeConfig.baseUrl = req.body.baseUrl;
  }

  var csvParser = new CsvParser('src/assets/data/patients.csv');
  csvParser.parse(function(data) {
    // var requests = [];
    // requests.push(EhrscapeRequest.getSession);

    EhrscapeRequest.getSession(function(err, res) {
      console.log(res);

      for (var i = 1; i < 2; i++) {
        console.log(data[i]);
        var party = new Patient(data[i]);
        // console.log(party.getDob());
        EhrscapeRequest.createPatientNew(party.toJSON(), function(err, res) {
          console.log(res);
        });
        // console.log(party.toJSON());
        // requests.push(EhrscapeRequest.createPatientNew(party.toJSON()));
      };

    });

    for (var i = 1; i < 2; i++) {
      var party = new Patient(data[i]);
      // console.log(party.toJSON());
      // requests.push(EhrscapeRequest.createPatientNew(party.toJSON()));
    };

    // async.series(requests, function(err, results) {
    //   var overallStatus = err ? 'FAILED' : 'SUCCESSFUL';
    //   res.json({ status: overallStatus, requests: results, config: EhrscapeConfig });
    // });

    res.json({ status: 'SUCCESSFUL' });
  });
});

module.exports = router;
