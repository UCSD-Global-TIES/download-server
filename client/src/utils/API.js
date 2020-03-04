import axios from "axios"

export default {
  getConnectionQuality: (cb) => {
    return axios.get("/api/connection")
  },
  downloadContent: (downloadData) => {
    const { url, type } = downloadData;
    return axios.post("/api/download", { url, type })
  }

  
};