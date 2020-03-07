const execSh = require("exec-sh");
execSh("npm run start:prod", function(err){
  if (err) {
    console.log("Exit code: ", err.code);
    return;
  }
});