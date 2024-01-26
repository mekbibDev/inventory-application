const router = require("express").Router();
const {
  createGet,
  createPost,
  detailsGet,
  editGet,
  editPost,
  deleteCategory,
} = require("../controller/category");

router.get("/details", detailsGet);

router.get("/create", createGet);
router.post("/create", createPost);

router.get("/:categoryId/edit", editGet);
router.post("/:categoryId/edit", editPost);

router.get("/:categoryId/delete", deleteCategory);

module.exports = router;
