const router = require("express").Router();
const {
  createGet,
  createPost,
  detailsGet,
  editGet,
  editPost,
} = require("../controller/category");

router.get("/details", detailsGet);

router.get("/create", createGet);
router.post("/create", createPost);

router.get("/:categoryId/edit", editGet);
router.post("/:categoryId/edit", editPost);

module.exports = router;
