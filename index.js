var express =   require("express");
var jsonServer = require('json-server');
var cors = require('cors');
var multer  =   require('multer');
var app  =   express();

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

app.set('port', (process.env.PORT ? process.env.PORT : 5000 || 5000))
var whitelist = ['https://localhost:4200', 'https://secure.ataata.us', 'http://localhost:5000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(console.log('Not allowed by CORS'))
    }
  },
  allowedHeaders: ['Access-Control-Allow-Headers', 'Content-Type'],
  credentials: true
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))
app.use(express.static('./public'))
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + file.originalname);
  }
});
var upload = multer({ storage : storage}).single('file');

const mockdataConfig = {
  noCors: true
}
app.use('/api-mock', jsonServer.router('db.json', mockdataConfig));

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            res.status(500)
            return res.json({
              message: err.message
            });
        }
        res.json({path: req.file.path.replace('public', '')});
    });
});


app.listen(app.get('port') ,function(){
    console.log("Working on port " + app.get('port') );
});