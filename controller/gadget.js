const {
  matchedData,
  validationResult,
  body,
  param,
} = require("express-validator");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const Category = require("../model/category");
const Gadget = require("../model/gadget");
const {
  removeGadgetFromCategories,
  addGadgetToCategories,
} = require("./utils");
const TWO_MB_SIZE = 1024 * 1024 * 2;
const ALLOWED_IMAGE_MIMETYPE = ["image/jpeg", "image/png", "image/webp"];
async function createGet(req, res, next) {
  try {
    const categories = await Category.find({});
    res.render("gadgetForm", { title: "Create gadget", categories });
  } catch (error) {
    next(error);
  }
}
const createPost = [
  upload.single("photo"),
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
      max: 40,
    })
    .withMessage(
      "Name must be at least 2 characters long and at most 40 characters long",
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
    .isInt({
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
      max: 200,
    })
    .withMessage(
      "Description must be at least 10 characters long and at most 200 characters long",
    ),
  body("categoryIds")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("At least one category must be selected"),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      const file = req.file;
      if (file && !ALLOWED_IMAGE_MIMETYPE.includes(file.mimetype))
        result.errors.push({
          msg: `Only these image types are allowed: ${ALLOWED_IMAGE_MIMETYPE.join(
            ", ",
          )}`,
        });
      if (file && file.size > TWO_MB_SIZE)
        result.errors.push({
          msg: "File size must be smaller or equal to 2 megabyte",
        });
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
        const gadgetData = {
          adminKey: data.adminKey,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          categories: [...categoryIds],
        };
        if (file) {
          gadgetData.photoMimeType = file.photoMimeType;
          gadgetData.photo = file.buffer;
        }
        const newGadget = new Gadget({
          ...gadgetData,
        });
        const savedGadget = await newGadget.save();
        await addGadgetToCategories(categoryIds, savedGadget._id);
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
        const gadget = await Gadget.findById(data.gadgetId, { adminKey: 0 });
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
  upload.single("photo"),
  param("gadgetId").trim().escape().notEmpty(),
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
      max: 40,
    })
    .withMessage(
      "Name must be at least 2 characters long and at most 40 characters long",
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
      max: 200,
    })
    .withMessage(
      "Description must be at least 10 characters long and at most 200 characters long",
    ),
  body("categoryIds")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("At least one category must be selected"),
  body("deletePhoto")
    .isBoolean()
    .optional()
    .withMessage("boolean value must be given for delete photo"),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      const file = req.file;
      const { adminKey, ...data } = matchedData(req);
      if (adminKey) {
        const { adminKey: gadgetAdminKey } = await Gadget.findById(
          data.gadgetId,
          "adminKey",
        );
        if (adminKey !== gadgetAdminKey)
          result.errors.unshift({ msg: "Admin key does not match" });
      }
      if (file && !ALLOWED_IMAGE_MIMETYPE.includes(file.mimetype))
        result.errors.push({
          msg: `Only these image types are allowed: ${ALLOWED_IMAGE_MIMETYPE.join(
            ", ",
          )}`,
        });
      if (file && file.size > TWO_MB_SIZE)
        result.errors.push({
          msg: "File size must be smaller or equal to 2 megabyte",
        });
      if (!result.isEmpty()) {
        const categories = await Category.find({});
        const { photo, photoMimeType } = await Gadget.findById(
          data.gadgetId,
          "photo photoMimeType",
        );
        res.render("gadgetForm", {
          errors: result.errors,
          categories,
          photo,
          photoMimeType,
          ...req.body,
          categoryIds: Array.isArray(req.body.categoryIds)
            ? req.body.categoryIds
            : [req.body.categoryIds],
        });
      } else {
        const categoryIds = [];
        if (Array.isArray(data.categoryIds)) {
          for await (let categoryId of data.categoryIds) {
            const categoryInDb = await Category.findById(categoryId);
            categoryIds.push(categoryInDb._id);
          }
        } else {
          categoryIds.push(data.categoryIds);
        }
        data.categories = categoryIds;
        const {
          // eslint-disable-next-line no-unused-vars
          categoryIds: categoryIdsToNotBeSent,
          gadgetId,
          ...gadgetUpdateData
        } = data;
        if (data.deletePhoto && data.deletePhoto == "true") {
          gadgetUpdateData.photoMimeType = null;
          gadgetUpdateData.photo = null;
        }
        if (file) {
          gadgetUpdateData.photoMimeType = file.photoMimeType;
          gadgetUpdateData.photo = file.buffer;
        }
        const gadgetBeforeUpdate = await Gadget.findByIdAndUpdate(
          gadgetId,
          gadgetUpdateData,
        );
        await addGadgetToCategories(categoryIds, gadgetBeforeUpdate._id);
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
const deleteGadget = [
  param("gadgetId").trim().escape().notEmpty(),
  param("adminKey").trim().escape().notEmpty(),
  async function (req, res, next) {
    try {
      const result = validationResult(req);
      const { adminKey, ...data } = matchedData(req);
      if (adminKey) {
        const { adminKey: gadgetAdminKey } = await Gadget.findById(
          data.gadgetId,
          "adminKey",
        );
        if (adminKey !== gadgetAdminKey)
          result.errors.unshift({ msg: "Admin key does not match" });
      }
      if (!result.isEmpty()) {
        const gadgets = await Gadget.find({}, { adminKey: 0 }).populate(
          "categories",
          { adminKey: 0 },
        );
        const categories = await Category.find({}, { adminKey: 0 });
        res.render("index", {
          errors: result.errors,
          url: `/gadget/${data.gadgetId}/`,
          title: "Gadget Inventory",
          adminKey,
          gadgets,
          categories,
        });
      } else {
        const data = matchedData(req);
        const deletedGadget = await Gadget.findByIdAndDelete(data.gadgetId);
        await removeGadgetFromCategories(deletedGadget, [], data.gadgetId);

        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { createGet, createPost, editGet, editPost, deleteGadget };
