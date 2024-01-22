const Gadget = require("../model/gadget");
const Categories = require("../model/category");
const Category = require("../model/category");

async function getAll(req, res, next) {
  try {
    const gadgets = await Gadget.find({}).populate("categories");
    const categories = await Categories.find({});
    res.render("index", { title: "Gadget Inventory", gadgets, categories });
  } catch (error) {
    next(error);
  }
}
async function filter(req, res, next) {
  try {
    const category = await Category.findById(req.query["category"]).populate(
      "gadgets",
    );
    const categories = await Categories.find({});
    res.render("index", {
      title: "Gadget Inventory",
      gadgets: category.gadgets,
      categories,
    });
  } catch (error) {
    next(error);
  }
}
module.exports = { getAll, filter };
