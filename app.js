var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var database = require('./condb');


var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());


app.use(session(
{
  cookieName : 'session',
  secret : '6789kjhv567b2uvh34',
  duration : (10 * 60 * 1000),
  activeDuration : (10 * 60 * 1000)
}
  ));




app.post('/project/postProject', function(req, res){

  if(req.session.memberId)
  {

    
    var newProject = new database.projectsTable();
    newProject.date = new Date().toISOString().substr(0, 10);
    newProject.postedBy = req.session.firstname;
    newProject.chapter = req.session.chapter;

  
        newProject.save(function(err, savedObject){

          if(err)
          {
            res.end("error connecting the mongoDB");
            console.log(err);
          }
          else
          {
            
            var sampleFile;
 
            if (!req.files) {
                res.send('No files were uploaded.');
                return;
            }
         
            sampleFile = req.files.pdfFile;
            var path = 'public/projects/'+savedObject.id+".pdf";
            sampleFile.mv(path, function(err) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    res.redirect('/project?projectPosted=1');
                }
            });
              
            
            
          }

        });


  }
  else
  {
    res.redirect('/?notlogin=1');
  }

});



var login = require('./routes/login');
var home = require('./routes/home');
var logout = require('./routes/logout');
var meeting = require('./routes/meeting');
var events = require('./routes/events');
var projects = require('./routes/projects');



app.use('/', routes);
app.use('/login', login);
app.use('/home', home);
app.use('/logout', logout);
app.use('/meeting', meeting);
app.use('/event', events);
app.use('/project', projects);





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


module.exports = app;
