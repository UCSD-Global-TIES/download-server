const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const objSchema = new Schema({
  property: {
    type: String,
    default: "",
    required: true
  }
});

const Obj = mongoose.model("Obj", objSchema);

module.exports = Obj;