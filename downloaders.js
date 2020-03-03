const ytdl = require('ytdl-core');
const scrape = require('website-scraper');
const request = require("request");
const metaScrape = require('html-metadata');
const zipFolder = require("zip-folder");
// const unzipper = require("unzipper");
// const find = require("find");
const fs = require('file-system');
const encodeURL = require('encodeurl')

const encodeUrl = (url) => {

    return encodeURL(url).replace("?", "%3F").replace("/", "%2F")
}

module.exports = {
    downloadWebsite: (url, path, startFn, endFn, errorFn) => {

    function extractHostname(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }

    metaScrape(url)
        .then(function (metadata) {
            const filename = `${metadata.general.title} (${extractHostname(url)})`;
            const fileData = {
                name: filename,
                type: "zip"
            }
            

            class MyPlugin {
                apply(registerAction) {
                    registerAction('beforeStart', async ({ options }) => {
                        startFn(fileData)
                        
                    });
                    registerAction('afterFinish', async () => {
                        endFn(fileData)            });
                    registerAction('error', async ({ error }) => {
                        errorFn(fileData)
                    });
                }
            }

            scrape({
                urls: [url],
                urlFilter: function (url) {
                    return url.includes(extractHostname(url));
                },
                // recursive: false,
                // maxRecursiveDepth: maxDepth,
                // filenameGenerator: 'bySiteStructure',
                directory: `${path}/${encodeURIComponent(filename)}`,
                plugins: [new MyPlugin()]
                
            }).then((result) => {
                const folderPath = `${path}/${encodeURIComponent(filename)}`
                // const htmlPath = `${folderPath}/${result[0].filename}`
                const zipPath = `${folderPath}.webzip`;

                zipFolder(folderPath, zipPath, function (err) {
                    if (err) {
                        errorFn(fileData);
                    } else {
                        fs.rmdirSync(folderPath);
                        
                        endFn(fileData)
     
                    }
                });
                
                
            })
             .catch((err) => errorFn(fileData)) ;
        });
        
    },
    downloadStream: (url, path, startFn, endFn, errorFn) => {
     
    // For now, restricting videos to Youtube
    const setStream = (filename, videoInfo) => {
        const stream = ytdl(url);
        // let starttime;

        // SET FILE UPLOAD DESTINATION
        stream.pipe(fs.createWriteStream(`${path}/${encodeURIComponent(filename)}.mp4`));

        // SET LISTENERS
        // if (isFunction(startFn)) {
        stream.once('response', () => {
            // starttime = Date.now();
            startFn(videoInfo);
        });
        // }

        // if (isFunction(progress_cb)) {
        //     stream.on('progress', (chunkLength, downloaded, total) => {
        //         const percent = downloaded / total;
        //         const elapsed = (Date.now() - starttime);
        //         // progress_cb(percent, elapsed);
        //     })
        // }

        // if (isFunction(endFm)) {
        stream.on('end', () => endFn(videoInfo));
        // }

        stream.on('error', () => errorFn(videoInfo));
    }

    const getID = (url) => {
        if (url.includes("youtu.be")) {
            return url.split("/")[url.split("/").length - 1]
        }


        let params = url.split("?")[1];
        params = params.split("&");
        for (const param of params) {
            const type = param.split("=")[0];
            const value = param.split("=")[1];

            if (type === "v") {
                return value;
            }
        }
    }

    // If the url goes to a valid video, download file
    if (ytdl.validateURL(url) && (url.includes("youtube.com") || url.includes("youtu.be"))) {
        // Retrieve video name if no name provided
        ytdl.getInfo(getID(url), (err, info) => {
            if (err) throw err;

            const fileData = {
                name: info.title,
                type: "mp4"
            }

            setStream(info.title, fileData);

        });
    } else {
        return null;
    }
   
    },
    downloadFile: (uri, path, startFn, endFn, errorFn) => {
        request.head(uri, function (err, res, body) {
        const filename = uri.split("/")[uri.split("/").length - 1]
        // Extract file type
        const type = res.headers[`content-type`].split("/")[1];

        const fileData = { name: filename, type };
            
        request(uri)
        .on('response', function (response) {
            startFn(fileData)
        })
        .on('error', function (err) {
            errorFn(fileData)
        })
        .pipe(fs.createWriteStream(`${path}/${filename}.${type}`))
        .on('close', () =>
                endFn(fileData)
            );
    });
},
}

// const linkCheck = require('link-check');
 
// linkCheck('http://sdkjadksj.com/', function (err, result) {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log(`${result.link} is ${result.status}`);
// });

// Unzip webpage folder, locate path to index.html
// -------------------------------------------------------------------------------------
// fs.createReadStream(zipPath)
//     .pipe(unzipper.Extract({ path: folderPath }))
//     .on("finish", () => {
//         find.file(folderPath, function (files) {
//             console.log(files.find(filename => filename.includes("index.html")))
//         })

//         fs.unlink(zipPath, () => console.log("zip removed"))

//     });