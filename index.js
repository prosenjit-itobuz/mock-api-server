var express =   require("express");
var jsonServer = require('json-server');
var cors = require('cors');
var multer  =   require('multer');
var app  =   express();
app.set('port', (process.env.PORT ? process.env.PORT : 5000 || 5000))
var whitelist = ['https://localhost:4200', 'https://secure.ataata.us']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions));
app.use(express.static('./public'))

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + file.originalname);
  }
});
var upload = multer({ storage : storage}).single('file');

app.use('/api-mock', jsonServer.router('db.json'));

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
        res.json({path: req.file.path});
    });
});


app.listen(app.get('port') ,function(){
    console.log("Working on port " + app.get('port') );
});