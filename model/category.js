const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ofGadgets: [{ type: mongoose.Schema.Types.ObjectId, ref: "gadget" }],
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
