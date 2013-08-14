var AWS = require("aws-sdk"),
    nunjucks = require("nunjucks"),
    nunjucksEnv = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(__dirname + "/templates/"),
      { autoescape: true }
    ),
    premailer = require('premailer-api');

module.exports = function(options) {
  if (!options.key) {
    throw 'aws "key" required';
  }
  if (!options.secret) {
    throw 'aws "secret" required';
  }

  var ses = new AWS.SES({
    accessKeyId: options.key,
    secretAccessKey: options.secret
  });

  var templates = {
    welcomeEmail: nunjucksEnv.getTemplate("welcome.html")
  };

  return {
    sendWelcomeEmail: function(options, callback) {
      var html = templates.welcomeEmail.render({
        fullName: options.fullName
      });

      premailer.prepare({
        html: html
      }, function(err, email) {
        if (err) {
          return callback(err);
        }

        ses.sendEmail({
          Source: "welcome@webmaker.org",
          Destination: {
            ToAddresses: [options.to],
          },
          Message: {
            Subject: {
              Data: "Welcome to Webmaker!",
              Charset: "utf8"
            },
            Body: {
              Text: {
                Data: email.text,
                Charset: "utf8"
              },
              Html: {
                Data: email.html,
                Charset: "utf8"
              }
            }
          }
        }, callback);
      });
    }
  };
};