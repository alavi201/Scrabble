if(process.env.NODE_ENV == 'development'){
  require('dotenv').config();
}
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const debug = require('debug')('term-project-667-project-alavi-chalke-mazumdar:server');

var index = require('./routes/index');
var users = require('./routes/users');
var tests = require('./routes/tests');

const http = require('http');
var app = express();
const server = http.createServer( app );
var port = (process.env.PORT || '3002');

const initSocket = require('socket.io')();
initSocket.listen( server );
server.listen( port );
server.on('error', onError);
server.on('listening', onListening);

app.io = initSocket;

var game = require('./controllers/game/index')(app);
var login = require('./controllers/login')(app);
var lobby = require('./controllers/lobby')(app);
var logout = require('./controllers/logout')(app);
var help = require('./controllers/help')(app);
var about = require('./controllers/about')(app);
var termsConditions = require('./controllers/termsConditions')(app);
var joinGame = require('./controllers/joinGame')(app);
var account = require('./controllers/account')(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/tests', tests);
app.use('/game', game);
app.use('/login', login);
app.use('/lobby',lobby);
app.use('/logout',logout);
app.use('/help',help);
app.use('/about',about);
app.use('/termsConditions',termsConditions);
app.use('/joinGame',joinGame);
app.use('/account',account);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('Listening on ' + bind);
}

module.exports = app;