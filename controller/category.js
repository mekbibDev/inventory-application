const { matchedData, validationResult, body } = require("express-validator");
const Category = require("../model/category");
async function createGet(req, res, next) {
  try {
    res.render("createCategory", { title: "Create Category" });
  } catch (error) {
    next(error);
  }
}
const createPost = [
  body("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Name is required")
    .customSanitizer(function capitalize(value) {
      return value[0].toUpperCase() + value.slice(1);
    })
    .isLength({
      min: 2,
      max: 20,
    })
    .withMessage(
      "Name must be at least 2 characters long and at most 20 characters long",
    )
    .custom(async (value) => {
      const category = await Category.findOne({ name: value });
      if (category) throw new Error("Category already exists");
    }),
  body("description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({
      min: 10,
      max: 100,
    })
    .withMessage(
      "Description must be at least 10 characters long and at most 100 characters long",
    ),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      const data = matchedData(req);
      if (!result.isEmpty()) {
        res.render("createCategory", {
          errors: result.errors,
          ...req.body,
        });
      } else {
        const newCategory = new Category({
          name: data.name,
          description: data.description,
        });
        const savedCategory = await newCategory.save();
        if (savedCategory === newCategory) res.redirect("/");
        else throw new Error("Category was not saved");
      }
    } catch (error) {
      next(error);
    }
  },
];
module.exports = { createGet, createPost };
