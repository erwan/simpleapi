
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
  if (err.status === 404 || err.message === "empty response") {
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

function getSuffixDomain(host) {
  return host.substring(host.indexOf(".") + 1, host.length);
}

function simplifyFragment(host, data) {
  var value, fragment;
  switch (data.type) {
  case "StructuredText":
    fragment = prismic.Fragments.initField(data);
    value = fragment.asHtml(function(doc, ctx){ return '/' + doc.type + "/" + doc.id; });
    break;
  case "Text":
  case "Date":
  case "Timestamp":
  case "Number":
  case "Select":
    fragment = prismic.Fragments.initField(data);
    value = fragment.asText();
    break;
  case "Link.web":
    value = data.value.url;
    break;
  case "Link.document":
    value = data.value.document;
    value.href = "http://" + host + "/documents/" + value.id;
    break;
  case "Group":
    fragment = prismic.Fragments.initField(data);
    value = fragment.value.map(function(groupDoc) {
      return simplifyDocument(host, groupDoc);
    });
    break;
  case "SliceZone":
    // fragment = prismic.Fragments.initField(data);
    value = data.value.map(function(slice) {
       return {
         "slice_type": slice.slice_type,
         "slice_label": slice.slice_label,
         "value": simplifyFragment(host, slice.value)
       };
     });
     break;
  default:
    value = data;
  }
  return value;
}

function simplifyDocument(host, prismicDoc) {
  var simple = {
    "uid": prismicDoc.uid,
    "type": prismicDoc.type,
    "tags": prismicDoc.tags
  };
  if (prismicDoc.id) {
    simple.id = prismicDoc.id;
    simple.href = "http://" + host + "/documents/" + prismicDoc.id;
  }
  for (var key in prismicDoc.data) {
    var data = prismicDoc.data[key];
    var k = key.split(".")[1] || key;
    simple[k] = simplifyFragment(host, data);
  }
  return simple;
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
app.route('/').get(function(req, res) {
  var domain = parseDomain(req.headers.host);
  if (domain) {
    init(domain);
    var p = prismic.withContext(req, res, function then(err, ctx) {
      res.render('repoindex', {
        domain: domain,
        suffixDomain: getSuffixDomain(req.headers.host),
        types: ctx.api.data.types,
        bookmarks: ctx.api.bookmarks
      });
    });
  } else {
    res.render('index', {
      suffixDomain: req.headers.host,
      host: req.headers.host
    });
  }
});

app.route('/torepo').get(function(req, res) {
  var target = req.query.repository;
  res.redirect("http://" + target + "." + req.headers.host);
});

app.route('/types/:docType').get(function(req, res){
  var domain = parseDomain(req.headers.host);
  if (domain) {
    init(domain);
    var p = prismic.withContext(req, res);
    p.query(prismic.Predicates.at('document.type', req.params.docType), req.query, function (err, response) {
      if(err) return handleError(err, req, res);
      res.json({
        page: response.page,
        results_per_page: response.results_per_page,
        results_size: response.results_size,
        total_results_size: response.total_results_size,
        total_pages: response.total_pages,
        next_page: response.next_page,
        prev_page: response.prev_page,
        results: response.results.map(function(d){
          return simplifyDocument(req.headers.host, d);
        })
      });
    });
  } else {
    res.send('404 Not Found', 404);
  }
});

app.route('/types/:docType/:uid').get(function(req, res){
  var domain = parseDomain(req.headers.host);
  if (domain) {
    init(domain);
    var p = prismic.withContext(req, res);
    p.getByUID(req.params.docType, req.params.uid, function (err, postContent) {
      if(err) return handleError(err, req, res);
      if (postContent) {
        res.json(simplifyDocument(req.headers.host, postContent));
      } else {
        res.send('404 Not Found', 404);
      }
    });
  } else {
    res.send('404 Not Found', 404);
  }
});

app.route('/documents/:docid').get(function(req, res){
  var domain = parseDomain(req.headers.host);
  if (req.params.docid && domain) {
    init(domain);
    var p = prismic.withContext(req,res);
    p.getByID(req.params.docid, function (err, postContent) {
      if(err) return handleError(err, req, res);
      res.json(simplifyDocument(req.headers.host, postContent));
    });
  } else {
    res.send('404 Not Found', 404);
  }
});

app.route('/bookmarks/:name').get(function(req, res){
  var domain = parseDomain(req.headers.host);
  if (req.params.name && domain) {
    init(domain);
    var p = prismic.withContext(req, res, function then(err, ctx) {
      var bookmarkId = ctx.api.bookmarks[req.params.name];
      if (!bookmarkId) {
        res.send('404 Not Found', 404);
      } else {
        ctx.api.forms('everything').ref(ctx.ref).query(prismic.Predicates.at('document.id', bookmarkId)).submit(function(err, response) {
          if(err) return handleError(err, req, res);
          if (response.results.length === 0) {
            res.send('404 Not Found', 404);
          } else {
            var doc = response.results[0];
            res.json(simplifyDocument(req.headers.host, doc));
          }
        });
      }
    });
  } else {
    res.send('404 Not Found', 404);
  }
});


var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
