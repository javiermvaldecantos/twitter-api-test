#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var url = require("url");
var path = require("path");
var fs = require('fs');
var keys = require('./keys.js');    // to keep the keys secret
var Twitter = require('twitter');

var app = express();
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

app.use(express.bodyParser());

var offset = "/app/";

app.get('*', function(request,response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd() + offset, uri);
    
    if(uri.substr(0,4) === '/api') {
        var resource = uri.substr(4);
        
        if(resource === '/getTweets') {
            // use twitter module
            var client = new Twitter({
              consumer_key: keys.CONSUMER_KEY,
              consumer_secret: keys.CONSUMER_SECRET,
              access_token_key: keys.ACCESS_TOKEN,
              access_token_secret: keys.ACCESS_TOKEN_SECRET
            });
            
            var params = {screen_name: request.query.screen_name, count: request.query.count};
            
            client.get('statuses/user_timeline', params, function(twitterError, tweets, twitterResponse) {
              if (!twitterError) {
//                  console.log(tweets);
                  response.send({success:true, data:tweets});
              } else {
                  response.send({success:false})
              }
            });
            
        } else {
            response.writeHead(404, {"Content-Type":"text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        
    } else {
        fs.exists(filename, function(exists) {
            if(!exists) {
              response.writeHead(404, {"Content-Type": "text/plain"});
              response.write("404 Not Found\n");
              response.end();
              console.log("couldn't find: " + filename);
              return;
            }

            if (fs.statSync(filename).isDirectory()) filename += '/index.html';

            fs.readFile(filename, "binary", function(err, file) {
              if(err) {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                console.log("error while loading: " + filename);
                return;
              }

              var type = "text/plain";
              var extn = path.extname(filename);
              switch(extn) {
                  case ".json":
                      type = "application/json"
                      break;
                  case ".js":
                      type = "text/javascript"
                      break;
                  case ".html":
                      type = "text/html";
                      break;
                  case ".css":
                      type = "text/css";
                      break;
                  default:
                      type = "text/plain";
              }


              response.writeHead(200, {"Content-Type": type});
              response.write(file, "binary");
              response.end();
            });
        });
    }

});

app.listen(app.get('port'), app.get('ip'), function() {
    console.log("✔ Express server listening at %s:%d ", app.get('ip'),app.get('port'));
});