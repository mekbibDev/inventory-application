const {
  matchedData,
  validationResult,
  body,
  param,
} = require("express-validator");
const Category = require("../model/category");
const Gadget = require("../model/gadget");
const { removeGadgetFromCategories } = require("./utils");

async function detailsGet(req, res, next) {
  try {
    const categories = await Category.find({}, { adminKey: 0 });
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
  body("adminKey")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Admin Key is required"),
  body("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Name is required")
    .customSanitizer(function capitalize(value) {
      if (value) return value[0].toUpperCase() + value.slice(1);
      return value;
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
          adminKey: data.adminKey,
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
        const category = await Category.findById(data.categoryId, {
          adminKey: 0,
        });
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
  body("adminKey")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Admin Key is required"),
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
      const { adminKey, ...data } = matchedData(req);
      if (adminKey) {
        const { adminKey: categoryAdminKey } = await Category.findById(
          data.categoryId,
          "adminKey",
        );
        if (adminKey !== categoryAdminKey)
          result.errors.unshift({ msg: "Admin key does not match" });
      }
      if (!result.isEmpty()) {
        res.render("categoryForm", {
          errors: result.errors,
          ...req.body,
        });
      } else {
        const { categoryId, ...categoryUpdateData } = data;
        await Category.findByIdAndUpdate(categoryId, { ...categoryUpdateData });
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  },
];
const deleteCategory = [
  param("categoryId").trim().escape().notEmpty(),
  param("adminKey").trim().escape().notEmpty(),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      const { adminKey, ...data } = matchedData(req);
      if (adminKey) {
        const { adminKey: categoryAdminKey } = await Category.findById(
          data.categoryId,
          "adminKey",
        );
        if (adminKey !== categoryAdminKey)
          result.errors.unshift({ msg: "Admin key does not match" });
      }
      if (!result.isEmpty()) {
        const categories = await Category.find({});
        res.render("categoryDetails", {
          errors: result.errors,
          url: `/category/${data.categoryId}/`,
          adminKey,
          categories,
        });
      } else {
        const deletedCategory = await Category.findByIdAndDelete(
          data.categoryId,
        );
        for await (const gadgetId of deletedCategory.gadgets) {
          const deletedGadget = await Gadget.findByIdAndDelete(gadgetId);
          await removeGadgetFromCategories(
            deletedGadget,
            [],
            gadgetId.toString(),
            deletedCategory._id.toString(),
          );
        }
        res.redirect("/category/details");
      }
    } catch (error) {
      next(error);
    }
  },
];
module.exports = {
  createGet,
  createPost,
  detailsGet,
  editGet,
  editPost,
  deleteCategory,
};
