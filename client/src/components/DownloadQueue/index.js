import React, { useEffect, useState, useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { ListItemAvatar, Avatar, List, ListItem, ListItemText, ListSubheader, Button, ButtonGroup, InputAdornment, FormControl, InputLabel, Input, Typography } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Beforeunload } from 'react-beforeunload';

import "../../utils/flowHeaders.min.css";
import {faDownload, faChevronLeft, faChevronRight, faFilePdf, faFileAudio, faFileCode, faFileCsv, faFileImage, faFileArchive, faFileAlt, faFileDownload, faFileVideo, faFileWord, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import SocketContext from "../../socket-context"

const useStyles = makeStyles(theme => ({
    root: {
        maxWidth: "700px",
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    fab: {
        position: 'fixed',
        bottom: "3rem",
        right: "3rem",
    },
    field: {
        margin: "1rem 0px"
    },
    vc: {
        maxWidth: "700px",
        width: "100%",
        margin: "auto"
    },
    searchbar: {
        margin: "0.5rem 0rem",
        width: "100%"
    },
    content: {
        width: "90%",
        maxWidth: "700px"
    },
}));

function DownloadQueue(props) {
    const pageMax = 5;
    const socket = useContext(SocketContext)
    const classes = useStyles();
    const [pageIdx, setPageIdx] = useState(0);
    const [downloads, setDownloads] = useState([]);
    const [filteredDownloads, setFilteredDownloads] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // HANDLE QUERY CHANGE
    const handleQueryChange = (event) => {
        const { value } = event.target;
        // Set search query
        setSearchQuery(value);

        // Reset page 
        setPageIdx(0)

        // Filter documents
        if (value.length) {
            const filteredDocuments = downloads.filter(document => document['name'].toLowerCase().includes(value.toLowerCase()));
            setFilteredDownloads(filteredDocuments);

        } else {
            // Reset the filtered documents to ALL documents
            setFilteredDownloads(downloads);
        }
    }

    const handlePageChange = (direction) => {
        setPageIdx(pageIdx + direction)

    }

    const handleQueueUpdate = (fileData) => {
        // Locate file in downloads
        const isFile = file => file.name === fileData.name;
        const idx = downloads.findIndex(isFile);

        const tmp = downloads;
        // If it does, update
        if (idx !== -1) {
            tmp.splice(idx, 1, fileData)
        }
        // If it doesn't exist, push into array
        else {
            const tmp = downloads;
            tmp.unshift(fileData)
        }

        // Set downloads to new array
        setDownloads(JSON.parse(JSON.stringify(tmp)))
        // Set filtered downloads based on new downloads and searchQuery
        setFilteredDownloads(JSON.parse(JSON.stringify(tmp.filter(document => document['name'].toLowerCase().includes(searchQuery.toLowerCase())))))

    }

    const getFileIcon = (type) => {
        // Return proper icon for specified file type
        let icon;

        if (type === "txt") icon = faFileAlt;
        else if (type === "doc" || type === "docx") icon = faFileWord
        else if (type === "mp3" || type === "wav" || type === "flac" || type === "aac") icon = faFileAudio;
        else if (type === "html" || type === "js" || type === "c" || type === "cpp" || type === "jsx" || type === "java" || type === "json" || type === "css") icon = faFileCode;
        else if (type === "pdf") icon = faFilePdf;
        else if (type === "mov" || type === "flv" || type === "avi" || type === "qt" || type === "mp4" || type === "mpg" || type === "mpeg" || type === "m4v") icon = faFileVideo;
        else if (type === "csv") icon = faFileCsv;
        else if (type === "xls" || type === "xlsx") icon = faFileExcel;
        else if (type === "gif" || type === "jpeg" || type === "jpg" || type === "tiff" || type === "png" || type === "svg") icon = faFileImage;
        else if (type === "zip" || type === "gzip" || type === "tar" || type === "rar" || type === "iso" || type === "7z" || type === "dmg" || type === "jar") icon = faFileArchive;
        else icon = faFileDownload;

        return icon;
    }


    useEffect(() => {

        const events = ['download-start', 'download-end', 'download-error']

        for (const event of events) {
            socket.on(event, data => handleQueueUpdate(data))
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={classes.root}>

            <div className={classes.vc} >

                <Beforeunload onBeforeunload={downloads.filter((item) => item.status === "Started").length ? () => "You have pending downloads, are you sure you want to leave this page?" : (e) => e} />

                    <div style={{ padding: "1rem" }}>


                        <FormControl className={classes.searchbar}>
                            <InputLabel htmlFor="standard-adornment-amount">Search downloads</InputLabel>
                            <Input
                                value={searchQuery}
                                onChange={handleQueryChange}
                                startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
                            />
                        </FormControl>

                        <List
                            className={classes.root}
                            subheader={
                                <ListSubheader component="div" style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Downloads ({downloads.filter((item) => item.status === "Started").length} pending)</span>
                                    <ButtonGroup size="small" aria-label="small outlined button group" style={{
                                        paddingTop: "9px",
                                        height: "2rem"
                                    }}>
                                        <Button size="small" disabled={pageIdx === 0} onClick={() => handlePageChange(-1)}><FontAwesomeIcon icon={faChevronLeft} /></Button>
                                        <Button size="small" disabled={pageIdx === Math.ceil(downloads.length / pageMax) - 1 || downloads.length === 0} onClick={() => handlePageChange(1)}><FontAwesomeIcon icon={faChevronRight} /></Button>
                                    </ButtonGroup>
                                </ListSubheader>}
                        >
                            {
                                filteredDownloads.length ?

                                    filteredDownloads.slice(pageIdx * pageMax, (pageIdx + 1) * pageMax).map((file, idx) => (

                                        <ListItem alignItems="flex-start" key={file.name + idx}>
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <FontAwesomeIcon icon={getFileIcon(file.type)} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                style={{ overflowWrap: "break-word" }}
                                                primary={file.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            className={classes.inline}
                                                            style={{
                                                                color:
                                                                    file.status === "Pending" ? "orange"
                                                                    : file.status === "Started" ? "blue"
                                                                        : file.status === "Completed" ? "green"
                                                                            : "red"
                                                            }}
                                                            color="textPrimary"
                                                        >
                                                            {file.status}
                                                        </Typography>
                                                        
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>


                                    ))

                                    :

                                    <div style={{ display: "flex", marginTop: "2rem" }}>
                                        <div style={{ margin: "auto", padding: "3rem" }}>
                                            <Typography className="flow-text" style={{ color: "grey" }} variant="h5">There are currently no downloads.</Typography>
                                            <p style={{ textAlign: "center", color: "grey" }}><FontAwesomeIcon icon={faDownload} size="5x" /></p>
                                        </div>
                                    </div>

                            }


                        </List>
                    </div>

            </div>
        </div>
    )
};

export default DownloadQueue;