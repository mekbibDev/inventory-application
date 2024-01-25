const router = require("express").Router();
const {
  createGet,
  createPost,
  editGet,
  editPost,
} = require("../controller/gadget");

router.get("/create", createGet);
router.post("/create", createPost);

router.get("/:gadgetId/edit", editGet);
router.post("/:gadgetId/edit", editPost);

module.exports = router;
