const mongoose = require("mongoose");
const Cars = mongoose.model("Cars", {
  brand: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  warna: {
    type: String,
    required: true,
  },
  harga: {
    type: String,
    required: true,
  },
});

module.exports = Cars;
