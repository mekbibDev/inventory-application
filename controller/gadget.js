const {
  matchedData,
  validationResult,
  body,
  param,
} = require("express-validator");
const Category = require("../model/category");
const Gadget = require("../model/gadget");
const { default: mongoose } = require("mongoose");

async function createGet(req, res, next) {
  try {
    const categories = await Category.find({});
    res.render("gadgetForm", { title: "Create gadget", categories });
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

        res.render("gadgetForm", {
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

const editGet = [
  param("gadgetId").trim().escape().notEmpty(),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty())
        throw new Error("A valid gadget id param must be given");
      else {
        const data = matchedData(req);
        const gadget = await Gadget.findById(data.gadgetId);
        const categories = await Category.find({});
        res.render("gadgetForm", {
          title: "Edit Gadget",
          ...gadget._doc,
          categories,
          categoryIds: [...gadget.categories],
        });
      }
    } catch (error) {
      next(error);
    }
  },
];
const editPost = [
  param("gadgetId").trim().escape().notEmpty(),
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

        res.render("gadgetForm", {
          errors: result.errors,
          categories,
          ...req.body,
          categoryIds: Array.isArray(req.body.categoryIds)
            ? req.body.categoryIds
            : [req.body.categoryIds],
        });
      } else {
        const categoryIds = [];
        const data = matchedData(req);
        if (Array.isArray(data.categoryIds)) {
          for await (let categoryId of data.categoryIds) {
            const categoryInDb = await Category.findById(categoryId);
            categoryIds.push(categoryInDb._id);
          }
        } else {
          categoryIds.push(data.categoryIds);
        }
        data.categories = categoryIds;
        // eslint-disable-next-line no-unused-vars
        const { gadgetId, ...gadgetUpdateData } = data;
        const gadgetBeforeUpdate = await Gadget.findByIdAndUpdate(
          gadgetId,
          gadgetUpdateData,
        );
        await addGadgetToCategories(categoryIds, gadgetId);
        await removeGadgetFromCategories(
          gadgetBeforeUpdate,
          categoryIds,
          gadgetId,
        );
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  },
];
async function addGadgetToCategories(categoryIds, gadgetId) {
  const gadgetObjectId = new mongoose.Types.ObjectId(gadgetId);
  for await (const categoryId of categoryIds) {
    const {
      gadgets: [...gadgetIds],
    } = await Category.findById(categoryId, "gadgets");
    const gadgetIdStrings = gadgetIds.map((gadgetId) => gadgetId.toString());
    if (!gadgetIdStrings.includes(gadgetId)) {
      gadgetIds.push(gadgetObjectId);
      await Category.findByIdAndUpdate(categoryId, { gadgets: gadgetIds });
    }
  }
}

async function removeGadgetFromCategories(
  gadgetBeforeUpdate,
  categoryIds,
  gadgetId,
) {
  for (const categoryId of gadgetBeforeUpdate.categories) {
    if (!categoryIds.includes(categoryId.toString())) {
      let {
        gadgets: [...gadgetIds],
      } = await Category.findById(categoryId, "gadgets");
      const filteredGadgetIds = gadgetIds.filter(
        (gadgetRef) => gadgetRef.toString() !== gadgetId,
      );
      gadgetIds = filteredGadgetIds;
      await Category.findByIdAndUpdate(categoryId, { gadgets: gadgetIds });
    }
  }
  // for await (const categoryId of categoriesToRemoveGadgetsFrom) {
  //   let gadgets = await Category.findById(categoryId, "gadgets");
  //   const filteredGadgets = Object.keys(gadgets)
  //     .filter((key) => gadgets[key].toString() !== gadgetId.toString())
  //     .reduce((res, key) => {
  //       res[key] = gadgets[key];
  //       return res;
  //     }, {});
  //   gadgets = filteredGadgets;
  //   await Gadget.findByIdAndUpdate(categoryId, gadgets);
  // }
}
module.exports = { createGet, createPost, editGet, editPost };
