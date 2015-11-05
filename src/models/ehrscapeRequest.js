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

EhrscapeRequest.doPostRequest = function(desc, options, showRequestBody, onResponse, callback) {
  var startDate = Date.now();
  request.post(options, function(error, response, body) {
    var timeTaken = (Date.now() - startDate) + 'ms';
    onResponse(body);
    var ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
    var err = (response.statusCode !== 200 && response.statusCode !== 201) ? true : null;
    console.log(desc);
    callback(err, ehrscapeRequest);
  });
}

EhrscapeRequest.doPutRequest = function(desc, options, showRequestBody, onResponse, callback) {
  var startDate = Date.now();
  request.put(options, function(error, response, body) {
    var timeTaken = (Date.now() - startDate) + 'ms';
    onResponse(body);
    var ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
    var err = (response.statusCode !== 200 && response.statusCode !== 201) ? true : null;
    console.log(desc);
    callback(err, ehrscapeRequest);
  });
}

EhrscapeRequest.doGetRequest = function(desc, options, showRequestBody, onResponse, callback) {
  var startDate = Date.now();
  request.get(options, function(error, response, body) {
    var timeTaken = (Date.now() - startDate) + 'ms';
    onResponse(body);
    var ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
    var err = (response.statusCode !== 200 && response.statusCode !== 201) ? true : null;
    console.log(desc);
    callback(err, ehrscapeRequest);
  });
}

EhrscapeRequest.getSession = function(callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'session',
    qs: { "username": EhrscapeConfig.username, "password": EhrscapeConfig.password }
  };
  EhrscapeRequest.doPostRequest("Create session", options, true, function(body) {
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
  EhrscapeRequest.doPostRequest("Create patient", options, true, function(body) {
    var body = JSON.parse(body);
    var subjectId = body.meta.href;
    EhrscapeConfig.subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
  }, callback);
}

EhrscapeRequest.createPatientDefault = function(callback) {
  var postPartyBody = fs.readFileSync('src/assets/sample_requests/party.json', 'utf8');
  EhrscapeRequest.createPatient(postPartyBody, callback);
}

EhrscapeRequest.createEhr = function(postEhrBody, subjectId, callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'ehr',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
    qs: { "subjectId": subjectId, "subjectNamespace": EhrscapeConfig.subjectNamespace, "commiterName": EhrscapeConfig.commiterName },
    body: postEhrBody
  };
  EhrscapeRequest.doPostRequest("Create EHR", options, true, function(body) {
    var body = JSON.parse(body);
    EhrscapeConfig.ehrId = body.ehrId;
  }, callback);
}

EhrscapeRequest.createEhrDefault = function(callback) {
  EhrscapeRequest.createEhr(null, EhrscapeConfig.subjectId, callback);
}

EhrscapeRequest.getEhr = function(subjectId, callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'ehr',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
    qs: { "subjectId": subjectId, "subjectNamespace": EhrscapeConfig.subjectNamespace }
  };
  EhrscapeRequest.doGetRequest("Get EHR", options, true, function(body) {}, callback);
}

EhrscapeRequest.updateEhr = function(postEhrBody, ehrId, callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'ehr/status/' + ehrId,
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
    body: postEhrBody
  };
  EhrscapeRequest.doPutRequest("Update EHR", options, true, function(body) {}, callback);
}

EhrscapeRequest.createPatientAndEhr = function(party, callback) {
  var results = [];
  EhrscapeRequest.createPatient(party.toJSON(true), function(err, res) {
    results.push(res);
    EhrscapeRequest.createEhr(null, party.getSubjectId(), function(err, res) {
      results.push(res);
      var ehrId;
      if (res.response.statusCode === 201) {
        var body = JSON.parse(res.response.responseBody);
        ehrId = body.ehrId;
        EhrscapeRequest.updateEhr(party.getEhrStatusBody(), ehrId, function(err, res) {
          results.push(res);
          callback(results, ehrId);
        });
      }
      if (res.response.statusCode === 400) {
        EhrscapeRequest.getEhr(party.getSubjectId(), function(err, res) {
          results.push(res);
          var body = JSON.parse(res.response.responseBody);
          ehrId = JSON.parse(body).ehrId;
          EhrscapeRequest.updateEhr(party.getEhrStatusBody(), ehrId, function(err, res) {
            results.push(res);
            callback(results, ehrId);
          });
        });
      }
    });
  });
}

EhrscapeRequest.uploadTemplate = function(title, templateFilePath, callback) {
  var postTemplateBody = fs.readFileSync(templateFilePath, 'utf8');
  var options = {
    url: EhrscapeConfig.baseUrl + 'template',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId },
    body: postTemplateBody
  };
  EhrscapeRequest.doPostRequest("Upload template (" + title + ")", options, false, function(body) {}, callback);
}

EhrscapeRequest.uploadTemplateDefault = function(callback) {
  EhrscapeRequest.uploadTemplate('Vital signs', 'src/assets/sample_requests/vital-signs-template.xml', callback);
}
  
EhrscapeRequest.uploadComposition = function(title, compositionFilePath, ehrId, templateId, callback) {
  var postCompositionBody = fs.readFileSync(compositionFilePath, 'utf8');
  var options = {
    url: EhrscapeConfig.baseUrl + 'composition',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
    body: postCompositionBody,
    qs: { "ehrId": ehrId, "templateId": templateId, "format": 'FLAT', "commiterName": EhrscapeConfig.commiterName }
  };
  EhrscapeRequest.doPostRequest("Upload composition (" + title + ")", options, true, function(body) {
    var body = JSON.parse(body);
    EhrscapeConfig.compositionId = body.compositionUid;
  }, callback);
}

EhrscapeRequest.uploadCompositionDefault = function(callback) {
  EhrscapeRequest.uploadComposition('Vital signs', 'src/assets/sample_requests/vital-signs-composition.json', EhrscapeConfig.ehrId, EhrscapeConfig.templateId, callback);
}

EhrscapeRequest.importCsv = function(csvFilePath, callback) {
  var buffer = fs.readFileSync(csvFilePath);
  var options = {
    url: EhrscapeConfig.baseUrl + 'import/csv',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/octet-stream' },
    body: buffer,
    qs: { "subjectNamespace": EhrscapeConfig.subjectNamespace, "templateId": EhrscapeConfig.templateId, "templateLanguage": 'en', "commiterName": EhrscapeConfig.commiterName }
  };
  EhrscapeRequest.doPostRequest("Import CSV", options, false, function(body) {}, callback);
}

module.exports = EhrscapeRequest;