const express = require("express");
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Start the API server
http.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});


const { downloadWebsite, downloadStream, downloadFile } = require("./downloaders");

io.on('connection', function (client) {  
  
  const startFn = (fileData) => {
    io.emit("download-started", fileData);
  }

  const endFn = (fileData) => {
    io.emit("download-completed", fileData);
  }

  const errorFn = (fileData) => {
    io.emit("download-error", fileData);
  }

  app.post("api/download", (req, res) => {
    const { url, type } = req.body;

    switch (type) {
      case "website":
        downloadWebsite(url, path, startFn, endFn, errorFn);
        res.json({})
        break;
      case "stream":
        downloadStream(url, path, startFn, endFn, errorFn);
        res.json({})
        break;
      case "file":
        downloadFile(url, path, startFn, endFn, errorFn);
        res.json({})
        break;
      default:
        res.json(null);
        break;
    }



  })
})
