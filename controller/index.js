const Gadget = require("../model/gadget");
const Categories = require("../model/category");
const Category = require("../model/category");
const { query, matchedData, validationResult } = require("express-validator");

async function getAll(req, res, next) {
  try {
    const gadgets = await Gadget.find({}).populate("categories");
    const categories = await Categories.find({});
    res.render("index", { title: "Gadget Inventory", gadgets, categories });
  } catch (error) {
    next(error);
  }
}
const filter = [
  query("category").notEmpty().escape(),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const data = matchedData(req);
        const category = await Category.findById(data.category).populate(
          "gadgets",
        );
        const categories = await Categories.find({});
        res.render("index", {
          title: "Gadget Inventory",
          gadgets: category.gadgets,
          selectedCategory: category,
          categories,
        });
      } else {
        throw new Error("A valid category must be chosen");
      }
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { getAll, filter };