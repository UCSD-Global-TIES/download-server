import axios from "axios"
import wifi from "node-wifi"
import NetworkSpeed from "network-speed"
import ytdl from "ytdl-core"
import linkCheck from 'link-check'

const testNetworkSpeed = new NetworkSpeed();

wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});

export default {
  getConnectionQuality: (cb) => {
    // List the current wifi connections
    wifi.getCurrentConnections( function (err, currentConnections) {
        if (err) {
            console.log(err);
        }

        if (!currentConnections) {
          cb(null)
        }
        else if (!currentConnections.length) {
          cb(null)
        } else {
          cb(currentConnections[0].quality)
        }

    });
  },
  getDownloadSpeed: (cb) => {
     const baseUrl = 'http://eu.httpbin.org/stream-bytes/50000000';
    const fileSizeInBytes = 50000000;
    const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
    cb(speed);
  },
  downloadContent: (url, type) => {
    return axios.post("/api/download", { url, type })
  },
  validateURL: (url, type, cb) => {

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

  
};