import React, { useEffect, useState } from "react";
import API from './utils/API';
import { makeStyles } from '@material-ui/core/styles';
import clsx from "clsx"
import "./App.css";
import { Popover, Fab, FormHelperText, Typography, Button, Select, TextField, InputLabel, MenuItem, FormControl, Badge } from "@material-ui/core"
import DownloadQueue from "./components/DownloadQueue"

import SocketContext from './socket-context'
import * as io from 'socket.io-client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer, faSpinner, faDownload } from "@fortawesome/free-solid-svg-icons";
import SignalWifiOffIcon from "@material-ui/icons/SignalWifiOff"
import SignalWifi0BarIcon from "@material-ui/icons/SignalWifi0Bar"
import SignalWifi1BarIcon from "@material-ui/icons/SignalWifi1Bar"
import SignalWifi2BarIcon from "@material-ui/icons/SignalWifi2Bar"
import SignalWifi3BarIcon from "@material-ui/icons/SignalWifi3Bar"
import SignalWifi4BarIcon from "@material-ui/icons/SignalWifi4Bar"

const socket = io()

const useStyles = makeStyles(theme => ({
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  fab: {
    zIndex: 2000,
    position: 'fixed',
    bottom: "3rem",
    right: "3rem",
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
  },
  validInput: {
    color: "green"
  },
  speedPopover: {
    backgroundColor: "#3bd3b3",
    padding: "1rem",
    color: "white",
    fontWeight: "bold"
  },
}));

const invalidHttp = "The URL must contain 'http' or 'https'.";
const validHttp = "The URL is valid!";

const invalidType = "Please select a content type!";
const validType = "content type selected!";

const NUM_REQUIRED = 2;

const strengthIcons = [<SignalWifi0BarIcon />, <SignalWifi1BarIcon />, <SignalWifi2BarIcon />, <SignalWifi3BarIcon />, <SignalWifi4BarIcon />]

function App() {
  const classes = useStyles();
  const [downloadData, setDownloadData] = useState({});
  const [success, setSuccess] = useState({});
  const [error, setError] = useState({});
  const [message, setMessage] = useState({});
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [wifiIcon, setWifiIcon] = useState(<SignalWifiOffIcon />);
  const [speed, setSpeed] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);


  const isValid = () => {
    let error = {};
    let success = {};
    let message = {};

    // Only validate if user has entered input and a non-empty string
    if (downloadData['url']) {
      if (downloadData['url'].length) {
        if (!downloadData['url'].includes("http") || !downloadData['url'].includes("https")) {
          // URL IS INVALID
          error['url'] = true;
          message['url'] = invalidHttp;
        } else {
          success['url'] = true;
          message['url'] = validHttp;
        }
      }
    }

    if (downloadData['type']) {
      success['type'] = true;
      message['type'] = `'${downloadData['type']}' ${validType}`;
    }

    setError({ ...error });
    setSuccess({ ...success });
    setMessage({ ...message });

  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let tmp = downloadData;
    tmp[name] = value;

    setDownloadData({ ...tmp })
    isValid();
  }

  const handleDownload = () => {

    if (Object.keys(success).length === NUM_REQUIRED) {
      // Perform API call
      setSending(true)
      API.downloadContent(downloadData)
        .then((res) => {
          setSending(false)

          // If url is invalid
          if (!res.data) {
            console.log("error")
          }

          setDownloadData({});
          setSuccess({});
          setError({});
          setMessage({});
        })
    } else {
      // Not all fields are filled out or valid
      // Show error for fields that are undefined
      let tmpError = { ...error };
      let tmpMessage = { ...message };
      if (!downloadData['type']) {
        tmpError['type'] = true;
        tmpMessage['type'] = invalidType;
      }

      if (!downloadData['url']) {
        tmpError['url'] = true;
        tmpMessage['url'] = invalidHttp;
      }

      setError({ ...tmpError });
      setMessage({ ...tmpMessage });
    }

  }

  const getStrengthLevel = (mbps) => {
    const division = strengthIcons.length;
    let levels = Math.floor(mbps / division)
    if (levels >= strengthIcons.length) {
      levels = strengthIcons.length - 1;
    }

    return levels
  }

  useEffect(() => {
    API.getConnectionQuality()
      .then((res) => {
        if (res.data) {
          setConnected(true);
          setSpeed(res.data.mbps)
          setWifiIcon(strengthIcons[getStrengthLevel(res.data.mbps)]);

        } else {
          setConnected(false);
          setWifiIcon(<SignalWifiOffIcon />);
        }

      })

    setInterval(() => {
      API.getConnectionQuality()
        .then((res) => {

          if (res.data) {
            setConnected(true);
            setSpeed(res.data.mbps)
            setWifiIcon(strengthIcons[getStrengthLevel(res.data.mbps)]);

          } else {
            setConnected(false);
            setWifiIcon(<SignalWifiOffIcon />);
          }

        })
    }, 5000)


  }, []);

  const contentTypes = [
    "website", "stream", "file"
  ]

  // Popover
  const openSpeed = event => {
    setAnchorEl(event.currentTarget);
  };

  const closeSpeed = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <SocketContext.Provider value={socket}>
      <Fab onClick={openSpeed} aria-label={"internet-connection-strength"} className={classes.fab} color={'primary'}>
        {wifiIcon}
      </Fab>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={closeSpeed}
        anchorOrigin={{
          vertical: -20,
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        
      >
        <Typography variant="overline" className={classes.speedPopover}>{Math.floor(speed / 8)} mb/s</Typography>
      </Popover>

      <div className="App" className={clsx(classes.flex, classes.app)}>
        <div className={clsx(classes.main, classes.flexCenter)}>
          <Typography
            variant="h4"
            color="primary"
            align="center"
            className={classes.input}
          >
            Download Server &nbsp;<FontAwesomeIcon icon={faServer} />
          </Typography>
          <TextField
            autoComplete="off"
            className={classes.input}
            label="URL"
            placeholder="Enter URL..."
            name="url"
            value={downloadData["url"] || ""}
            onChange={handleFormChange}
            fullWidth
            success={`${success['url']}`}
            error={error['url']}
            helperText={<span className={success['url'] ? classes.validInput : null}>{message['url'] || ""}</span>}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <div >

            <FormControl fullWidth className={clsx(classes.input, classes.formControl)}>
              <InputLabel shrink>Content Type</InputLabel>
              <Select
                error={error['type']}
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
              <FormHelperText className={success['type'] ? classes.validInput : null}>{message['type'] || ""}</FormHelperText>
            </FormControl>

          </div>
          <div className={classes.flex}>
            <Button
              className={classes.flexCenter}
              variant="contained"
              color="primary"
              style={{ backgroundColor: "#21c921" }}
              onClick={handleDownload}
              disabled={sending || !connected}
              endIcon={sending ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
            >
              Download
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
