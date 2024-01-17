const Gadget = require("../model/gadget");

async function handleGet(req, res) {
  const gadgets = await Gadget.find({}).populate("categories");
  res.render("gadget", { title: "Gadgets", gadgets });
}

module.exports = { handleGet };
