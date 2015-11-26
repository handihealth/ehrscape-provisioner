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
    var err = (response == undefined || (response.statusCode !== 200 && response.statusCode !== 201)) ? true : null;
    if (!err) {
      onResponse(body);
    }
    var ehrscapeRequest;
    if (response != undefined) {
      ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
      console.log(response.statusCode + ' | ' + desc);
    } else {
      ehrscapeRequest = new EhrscapeRequest({ description: desc, url: options.url, method: 'POST', requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: '' });
      console.log(error + ' | ' + desc);
    }
    callback(err, ehrscapeRequest);
  });
}

EhrscapeRequest.doPutRequest = function(desc, options, showRequestBody, onResponse, callback) {
  var startDate = Date.now();
  request.put(options, function(error, response, body) {
    var timeTaken = (Date.now() - startDate) + 'ms';
    var err = (response == undefined || (response.statusCode !== 200 && response.statusCode !== 201)) ? true : null;
    if (!err) {
      onResponse(body);
    }
    var ehrscapeRequest;
    if (response != undefined) {
      ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
      console.log(response.statusCode + ' | ' + desc);
    } else {
      ehrscapeRequest = new EhrscapeRequest({ description: desc, url: options.url, method: 'PUT', requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: '' });
      console.log(error + ' | ' + desc);
    }
    callback(err, ehrscapeRequest);
  });
}

EhrscapeRequest.doGetRequest = function(desc, options, showRequestBody, onResponse, callback) {
  var startDate = Date.now();
  request.get(options, function(error, response, body) {
    var timeTaken = (Date.now() - startDate) + 'ms';
    var err = (response == undefined || (response.statusCode !== 200 && response.statusCode !== 201)) ? true : null;
    if (!err) {
      onResponse(body);
    }
    var ehrscapeRequest;
    if (response != undefined) {
      ehrscapeRequest = new EhrscapeRequest({ description: desc, url: response.request.href, method: response.request.method, requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: response.statusCode });
      console.log(response.statusCode + ' | ' + desc);
    } else {
      ehrscapeRequest = new EhrscapeRequest({ description: desc, url: options.url, method: 'POST', requestBody: showRequestBody ? options.body : '', timeTaken: timeTaken, responseBody: body, statusCode: '' });
      console.log(error + ' | ' + desc);
    }
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

EhrscapeRequest.createPatient = function(title, postPartyBody, callback) {
  var options = {
    url: EhrscapeConfig.baseUrl + 'demographics/party',
    headers: { 'Ehr-Session': EhrscapeConfig.sessionId, 'Content-Type': 'application/json' },
    body: postPartyBody
  };
  EhrscapeRequest.doPostRequest("Create patient (" + title + ")", options, true, function(body) {
    var body = JSON.parse(body);
    var subjectId = body.meta.href;
    EhrscapeConfig.subjectId = subjectId.substr(subjectId.lastIndexOf('/')+1);
  }, callback);
}

EhrscapeRequest.createPatientDefault = function(callback) {
  var postPartyBody = fs.readFileSync('src/assets/sample_requests/party.json', 'utf8');
  EhrscapeRequest.createPatient('Steve Walford', postPartyBody, callback);
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

EhrscapeRequest.createPatientEhrAndCompositions = function(party, allergyTemplateNumCycle, proceduresTemplateNumCycle, labResultsTemplateNumCycle, orderTemplateNumCycle, problemTemplateNumCycle, callback) {
  var results = [];
  EhrscapeRequest.createPatient(party.getFullName(), party.toJSON(true), function(err, res) {
    results.push(res);
    if (err) {
      callback(err, results, null, party);
      return;
    }
    EhrscapeRequest.createEhr(null, party.getSubjectId(), function(err, res) {
      results.push(res);
      var ehrId;
      if (res.response.statusCode === 201) {
        var body = JSON.parse(res.response.responseBody);
        ehrId = JSON.parse(body).ehrId;
        EhrscapeRequest.updateEhr(party.getEhrStatusBody(), ehrId, function(err, res) {
          results.push(res);
          callback(err, results, ehrId, party);
        });
      }
      if (res.response.statusCode === 400) {
        EhrscapeRequest.getEhr(party.getSubjectId(), function(err, res) {
          results.push(res);
          if (err) {
            callback(err, results, null, party);
            return;
          }
          var body = JSON.parse(res.response.responseBody);
          ehrId = JSON.parse(body).ehrId;
          EhrscapeRequest.updateEhr(party.getEhrStatusBody(), ehrId, function(err, res) {
            results.push(res);
            if (err) {
              callback(err, results, null, party);
              return;
            }
            EhrscapeRequest.uploadCompositions(ehrId, allergyTemplateNumCycle, proceduresTemplateNumCycle, labResultsTemplateNumCycle, orderTemplateNumCycle, problemTemplateNumCycle, function(err, res) {
              results = results.concat(res);
              callback(err, results, ehrId, party);
            });

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
  EhrscapeRequest.uploadTemplate('Vital signs', 'src/assets/sample_requests/vital-signs/vital-signs-template.xml', callback);
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
  EhrscapeRequest.uploadComposition('Vital signs', 'src/assets/sample_requests/vital-signs/vital-signs-composition.json', EhrscapeConfig.ehrId, EhrscapeConfig.templateId, callback);
}

EhrscapeRequest.uploadCompositions = function(ehrId, allergyTemplateNumCycle, proceduresTemplateNumCycle, labResultsTemplateNumCycle, orderTemplateNumCycle, problemTemplateNumCycle, callback) {
  var results = [];

  var orderTemplateName = 'IDCR Lab Order FLAT ' + orderTemplateNumCycle.get().version + '.json';
  EhrscapeRequest.uploadComposition('Orders ' + ehrId, 'src/assets/sample_requests/orders/' + orderTemplateName, ehrId, 'IDCR - Laboratory Order.v0', function(err, res) {
    results.push(res);

    var allergyTemplateName = 'AllergiesList_' + allergyTemplateNumCycle.get().version + 'FLAT.json';
    EhrscapeRequest.uploadComposition('Allergies ' + ehrId, 'src/assets/sample_requests/allergies/' + allergyTemplateName, ehrId, 'IDCR Allergies List.v0', function(err, res){
      results.push(res);

      var proceduresTemplateName = 'IDCR Procedures List_' + proceduresTemplateNumCycle.get().version + ' FLAT.json';
      EhrscapeRequest.uploadComposition('Procedures ' + ehrId, 'src/assets/sample_requests/procedures/' + proceduresTemplateName, ehrId, 'IDCR Procedures List.v0', function(err, res) {
        results.push(res);

        var labResultsTemplateName = 'IDCR - Lab Report FLAT INPUT ' + labResultsTemplateNumCycle.get().version + '.json';
        EhrscapeRequest.uploadComposition('Lab Results ' + ehrId, 'src/assets/sample_requests/lab-results/' + labResultsTemplateName, ehrId, 'IDCR - Laboratory Test Report.v0', function(err, res) {
          results.push(res);

          var problemTemplate = problemTemplateNumCycle.get();
          var problemTemplatesToLoad = problemTemplate.subVersions.length;

          for (var i = problemTemplate.subVersions.length - 1; i >= 0; i--) {
            var templateVersion = problemTemplate.version + '_' + problemTemplate.subVersions[i];
            var templateName = templateVersion + '_IDCR ProblemList.v1.json';
            EhrscapeRequest.uploadComposition('Problems ' + ehrId + '/' + templateVersion, 'src/assets/sample_requests/problems/' + templateName, ehrId, 'IDCR Problem List.v1', function(err, res) {
              results.push(res);
              problemTemplatesToLoad -= 1;
              console.log('problemTemplatesToLoad = ' + problemTemplatesToLoad);
              if (problemTemplatesToLoad === 0) {
                console.log('calling callback');
                callback(err, results);
              }
            });
          }

        });

      });

    });

  });

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