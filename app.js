
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

// Routes
app.route('/').get(function(req, res){
  res.render('index');
});

// Routes
app.route('/api/:repository/:docType/:uid').get(function(req, res){
  // Prismic configuration
  // TODO case for protected repository and linkResolver configuration
  var configuration = {
    apiEndpoint: 'https://'+req.params.repository+'.prismic.io/api',
    // -- Access token if the Master is not open
    // accessToken: 'xxxxxx',
    // OAuth
    // clientId: 'xxxxxx',
    // clientSecret: 'xxxxxx',

    // -- Links resolution rules
    // This function will be used to generate links to Prismic.io documents
    // As your project grows, you should update this function according to your routes
    linkResolver: function(doc, ctx) {
      return '/';
    }
  };

  prismic.init(configuration);
  //call the prismic repository with the query parameters
  var p = prismic.withContext(req,res);
    p.getByUID(req.params.docType, req.params.uid, function (err, postContent) {
      if(err) return handleError(err, req, res);
      res.render('result', {
        postContent: postContent
      });
    });
  });

app.route('/preview').get(prismic.preview);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
