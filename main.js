const execSh = require("exec-sh");
execSh("npm start", function(err){
  if (err) {
    console.log("Exit code: ", err.code);
    return;
  }
});