const {
  matchedData,
  validationResult,
  body,
  param,
} = require("express-validator");
const Category = require("../model/category");

async function detailsGet(req, res, next) {
  try {
    const categories = await Category.find({});
    res.render("categoryDetails", { categories });
  } catch (error) {
    next(error);
  }
}

async function createGet(req, res, next) {
  try {
    res.render("categoryForm", { title: "Create Category" });
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
      max: 200,
    })
    .withMessage(
      "Description must be at least 10 characters long and at most 200 characters long",
    ),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        res.render("categoryForm", {
          errors: result.errors,
          ...req.body,
        });
      } else {
        const data = matchedData(req);
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

const editGet = [
  param("categoryId").trim().escape().notEmpty(),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty())
        throw new Error("A valid category id param must be sent");
      else {
        const data = matchedData(req);
        const category = await Category.findById(data.categoryId);
        res.render("categoryForm", {
          title: "Edit Category",
          name: category.name,
          description: category.description,
        });
      }
    } catch (error) {
      next(error);
    }
  },
];

const editPost = [
  param("categoryId").trim().escape().notEmpty(),
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
    ),
  body("description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({
      min: 10,
      max: 200,
    })
    .withMessage(
      "Description must be at least 10 characters long and at most 200 characters long",
    ),
  async function (req, res, next) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        res.render("categoryForm", {
          errors: result.errors,
          ...req.body,
        });
      } else {
        const { categoryId, ...categoryUpdateData } = matchedData(req);
        await Category.findByIdAndUpdate(categoryId, { ...categoryUpdateData });
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { createGet, createPost, detailsGet, editGet, editPost };
