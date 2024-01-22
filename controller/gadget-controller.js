const Gadget = require("../model/gadget");
const Categories = require("../model/category");
const Category = require("../model/category");

async function handleGet(req, res) {
  const gadgets = await Gadget.find({}).populate("categories");
  const categories = await Categories.find({});
  res.render("gadget", { title: "Gadgets", gadgets, categories });
}
async function filter(req, res, next) {
  try {
    const category = await Category.findById(req.query["category"]).populate(
      "gadgets",
    );
    const categories = await Categories.find({});
    res.render("gadget", {
      title: "Gadgets",
      gadgets: category.gadgets,
      categories,
    });
  } catch (error) {
    next(error);
  }
}
module.exports = { handleGet, filter };
