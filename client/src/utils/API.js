import axios from "axios"
import NetworkSpeed from "network-speed"

const testNetworkSpeed = new NetworkSpeed();

export default {
  getConnectionQuality: (cb) => {

    axios.get("/api/connection")
    .then(() => cb())
  },
  getDownloadSpeed: async (cb) => {
     const baseUrl = 'http://eu.httpbin.org/stream-bytes/50000000';
    const fileSizeInBytes = 50000000;
    const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
    cb(speed);
  },
  downloadContent: (downloadData) => {
    const { url, type } = downloadData;
    return axios.post("/api/download", { url, type })
  }

  
};