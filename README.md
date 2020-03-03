## Download Server | Schoolhouse Ghana

*A simple Express.js server hosting a React-based UI to download videos, web pages, and other files. **Built specifically for Schoolhouse Ghana (react-schoolhouse-ghana)***

### Basic Installation
1. Clone the repo
```
git clone https://github.com/matteuc/download-server.git
```

2. Install dependencies
```
npm i
```

3. Start the server (web page will open automatically in your browser)
```
npm start
```

#### Notes
- Running the server will automatically create a folder called *sg-downloads* in the same directory as the repository; this folder will store all files downloaded with the server

### External Drive Installation

*The download server was designed for non-technical people in mind. As such, the download server may also be installed onto a external drive and ran as an executable.*

1. Do steps 1 & 2 of the 'Basic Installation' process (on the external drive)

2. Package the server
```
npm run package
``` 
3. Click the executable corresponding to your OS (in the file explorer)
###### For Linux
> download-server-linux

###### For Mac OS
> download-server-macos

###### For Windows
> download-server-win







