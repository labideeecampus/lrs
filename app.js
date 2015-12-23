var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var auth = require('basic-auth');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(function(req, res, next) {
    var phantom_db = [
        {
            name:"labidee",
            pass:"!!labidee@#"
        }
    ];
    var user = auth(req);
    res.setHeader('X-Experience-API-Version', '1.0.2');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,If-Match,If-None-Match,X-Experience-API-Version, Accept-Language');
    res.setHeader('Access-Control-Expose-Headers', 'ETag,Last-Modified,Cache-Control,Content-Type,Content-Length,WWW-Authenticate,X-Experience-API-Version, Accept-Language');
    if (!user || user.name !== phantom_db[0].name || user.pass !== phantom_db[0].pass) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="ADLLRS"');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('Access denied')
    } else {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000');
        //res.setHeader('Content-Encoding', 'gzip');
        next()
    }
});
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/*var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

http.createServer(app).listen(port,ipaddress, function(){
    console.log('Express server listening on ' + ipaddress + ' port ' + port);
});*/

module.exports = app;
