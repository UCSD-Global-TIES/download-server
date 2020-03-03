const express = require("express");
const app = express();
const cors = require('cors')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: "*",
  exposedHeaders: ['Access-Control-Allow-Origin']
}))

// Start the API server
http.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});

// Run test command
// const execSh = require("exec-sh");
// execSh("cd client && npm start", function(err){
//   if (err) {
//     console.log("Exit code: ", err.code);
//     return;
//   }
// });

const { downloadWebsite, downloadStream, downloadFile } = require("./downloaders");
const linkCheck = require('link-check');
const ytdl = require('ytdl-core')


// Download Path (create directory)
const path = "../sg-downloads";
if (!fs.existsSync(path)){
  fs.mkdirSync(path);
}

io.on('connection', function (client) {

  const startFn = (fileData) => {
    const tmp = { ...fileData }
    tmp.status = "Started"
    io.emit("download-start", { ...tmp });
  }

  const endFn = (fileData) => {
    const tmp = { ...fileData }
    tmp.status = "Completed"
    io.emit("download-end", { ...tmp });
  }

  const errorFn = (fileData) => {
    const tmp = { ...fileData }
    tmp.status = "Error";
    io.emit("download-error", { ...tmp });
  }

  const validateUrl = (url, type, cb) => {
    switch (type) {
      case "website":
      case "file":
        linkCheck(url, function (err, result) {
          if (err) {
            console.error(err);
            return;
          }

          if (result.status === "alive") cb(true)
          else cb(false)
        });
        break;
      case "stream":
        cb(ytdl.validateURL(url));
        break;
    }

  }

  app.post("/api/download", (req, res) => {
    const { url, type } = req.body;

    switch (type) {
      case "website":
        validateUrl(url, type, (isValid) => {
          if (isValid) {
            downloadWebsite(url, path, startFn, endFn, errorFn);
            res.json({})
          } else res.json(null)
        })
        break;
      case "stream":
        validateUrl(url, type, (isValid) => {
          if (isValid) {

            downloadStream(url, path, startFn, endFn, errorFn);
            res.json({})
          } else res.json(null)
        })
        break;
      case "file":
        validateUrl(url, type, (isValid) => {
          if (isValid) {
            downloadFile(url, path, startFn, endFn, errorFn);
            res.json({})
          } else res.json(null)
        })
        break;
      default:
        res.json(null);
        break;
    }

  })

  const NetworkSpeed = require('network-speed');
  const checkInternetConnected = require('check-internet-connected');
  app.get("/api/connection", (req, res) => {
    const testNetworkSpeed = new NetworkSpeed();
    
    async function getNetworkDownloadSpeed() {
      const baseUrl = 'http://eu.httpbin.org/stream-bytes/50000000';
      const fileSizeInBytes = 50000000;
      const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
      res.json(speed);
    }

    checkInternetConnected()
    .then(() => {
      getNetworkDownloadSpeed();
    })
    .catch(() => {
      res.json(null); 
    });



  })

})
