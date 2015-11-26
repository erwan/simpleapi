
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path'),
    prismic = require('express-prismic').Prismic;


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon("public/images/punch.png"));
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('1234'));
app.use(session({secret: '1234', saveUninitialized: true, resave: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send("404 not found");
  } else {
    res.status(500).send("Error 500: " + err.message);
  }
}

function parseDomain(host) {
  var arr = host.split(".");
  if (arr.length === 3) return arr[0];
  return null;
}

function init(domain) {
  var configuration = {
    apiEndpoint: 'https://'+domain+'.prismic.io/api',
    linkResolver: function(doc, ctx) {
      return '/' + doc.type + "/" + doc.id;
    }
  };
  prismic.init(configuration);
}

// Routes
app.route('/').get(function(req, res){
  var domain = parseDomain(req.headers.host);
  if (domain) {
    init(domain);
    res.render('repoindex', {domain: domain});
  } else {
    res.render('index');
  }
});

app.route('/torepo').get(function(req, res) {
  var target = req.query.repository;
  res.redirect("http://" + target + "." + req.headers.host);
});

app.route('/api/:docType/:uid').get(function(req, res){
  var domain = parseDomain(req.headers.host);
  if (domain) {
    init(domain);
    var p = prismic.withContext(req,res);
    p.getByUID(req.params.docType, req.params.uid, function (err, postContent) {
      if(err) return handleError(err, req, res);
      res.render('result', {
        postContent: postContent
      });
    });
  } else {
    res.render('TODO: redirige vers le formulaire pour saisir le domaine');
  }
});

app.route('/preview').get(prismic.preview);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
