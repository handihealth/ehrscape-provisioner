var express = require('express');
var async = require('async');
var router = express.Router();

var EhrscapeConfig = require('../models/ehrscapeConfig');
var EhrscapeRequest = require('../models/ehrscapeRequest');

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
  res.json({ status: 'SUCCESSFUL' });
});

module.exports = router;
