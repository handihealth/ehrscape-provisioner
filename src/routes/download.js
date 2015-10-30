var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/workspace-markdown', function(req, res, next) {

  function processMarkdown(markdown) {
    for (item in req.query) {
      markdown = markdown.replace('{{' + item + '}}', req.query[item]);
    }
    return markdown;
  }

  fs.readFile('src/markdown_templates/workspace.md', { encoding: 'UTF-8' }, function(err, data) {
    console.log(err);
    res.setHeader("Content-Type", "text/markdown");
    res.setHeader("Content-Disposition", 'attachment; filename="workspace.md"');
    res.send(processMarkdown(data));
  });

});

module.exports = router;
