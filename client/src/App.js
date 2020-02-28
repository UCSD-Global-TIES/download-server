import React, { useEffect, useState } from "react";
import API from './utils/API';
import { makeStyles } from '@material-ui/core/styles';
import clsx from "clsx"
import "./App.css";
import {Button, Select, TextField, InputLabel, MenuItem, FormControl} from "@material-ui/core"
import DownloadQueue from "./components/DownloadQueue"

import SocketContext from './socket-context'
import * as io from 'socket.io-client'

const socket = io()

const useStyles = makeStyles(theme => ({
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    // marginTop: theme.spacing(2),
  },
  app: {
    padding: "2rem",
  },
  main: {
    maxWidth: "600px",
    width: "90%"
  },
  flex: {
    display: "flex"
  },
  flexCenter: {
    margin: "auto"
  },
  input: {
    marginBottom: "2rem"
  },
  queue: {
    margin: "2rem 0rem"
  }
}));

function App() {
  const classes = useStyles();
  const [downloadData, setDownloadData] = useState({})

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let tmp = downloadData;
    tmp[name] = value;

    setDownloadData({ ...tmp })
  }

  const handleDownload = () => {
    
    // Perform API call
    API.downloadContent(downloadData)
    .then((res) => {
      // If url is invalid
      if (!res.data) {
        console.log("error")
      }
    })
  }

  useEffect(() => {
  }, []);

  const contentTypes = [
    "website", "stream", "file"
  ]

  return (
      <SocketContext.Provider value={socket}>

      <div className="App" className={clsx(classes.flex,classes.app)}>
        <div className={clsx(classes.main, classes.flexCenter)}>    
          <TextField
            className={classes.input}
              label="URL"
              placeholder="Enter URL..."
              name="url"
              value={downloadData["url"] || ""}
                onChange={handleFormChange}
                fullWidth
            />
          <div >

            <FormControl fullWidth className={clsx(classes.input,classes.formControl)}>
            <InputLabel>Content Type</InputLabel>
            <Select
                name="type"
              value={downloadData["type"] || ""}
              onChange={handleFormChange}
              >
                {contentTypes.map((item, idx) => (
                  <MenuItem
                    value={item}
                    key={item + idx}
                  >
                    {item}</MenuItem>

                ))}
            
            </Select>
            </FormControl>
          
          </div>
          <div className={classes.flex}>
            <Button
              className={classes.flexCenter}
            variant="contained"
            color="primary"
            onClick={handleDownload} >
            Add Download
            </Button>
          </div>
          <div className={classes.queue}>
          <DownloadQueue />
          </div>
          </div>
      </div>
      </SocketContext.Provider>
  );
}

export default App;
