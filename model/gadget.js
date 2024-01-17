const mongoose = require("mongoose");

const GadgetSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  categories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  ],
});

const Gadget = mongoose.model("Gadget", GadgetSchema);

module.exports = Gadget;
