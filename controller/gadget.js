const { matchedData, validationResult, body } = require("express-validator");
const Category = require("../model/category");
const Gadget = require("../model/gadget");

async function createGet(req, res, next) {
  try {
    const categories = await Category.find({});
    res.render("createGadget", { categories });
  } catch (error) {
    next(error);
  }
}
const handlePost = [
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
      const gadget = await Gadget.findOne({ name: value });
      if (gadget) throw new Error("Gadget already exists");
    }),
  body("price")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({
      min: 0,
    })
    .withMessage("Price must be a number and greater or equal to zero")
    .withMessage("The price must at minium be 0"),
  body("stock")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Stock is required")
    .isFloat({
      min: 0,
    })
    .withMessage("Stock must be a number and greater or equal to zero")
    .isLength({ min: 0 })
    .withMessage("The minium number of stock is zero"),
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
  body("categoryIds")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("At least one category must be selected"),
  async function (req, res, next) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        const categories = await Category.find({});

        res.render("createGadget", {
          errors: result.errors,
          categories,
          ...req.body,
          categoryIds: Array.isArray(req.body.categoryIds)
            ? req.body.categoryIds
            : [req.body.categoryIds],
        });
      } else {
        const categories = [];
        const data = matchedData(req);
        if (Array.isArray(data.categoryIds)) {
          for await (let categoryId of data.categoryIds) {
            const categoryInDb = await Category.findById(categoryId);
            categories.push(categoryInDb._id);
          }
        } else {
          categories.push(data.categoryIds);
        }
        const newGadget = new Gadget({
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          categories: [...categories],
        });
        const savedGadget = await newGadget.save();
        if (savedGadget === newGadget) res.redirect("/");
        else throw new Error("Gadget was not saved");
      }
    } catch (error) {
      next(error);
    }
  },
];
module.exports = { createGet, handlePost };
