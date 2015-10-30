var EhrscapeRequest = function(props) {
  this.description = props.description;
  this.method = props.method;
  this.url = props.url;
  this.request = {
    "requestBody": props.requestBody,
    "timeTaken": props.timeTaken
  }
  this.response = {
    "statusCode": props.statusCode,
    "responseBody": JSON.stringify(props.responseBody, null, 2)
  }
}

module.exports = EhrscapeRequest;