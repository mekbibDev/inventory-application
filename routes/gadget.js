const router = require("express").Router();
const {
  createGet,
  handlePost,
  editGet,
  editPost,
} = require("../controller/gadget");

router.get("/create", createGet);
router.post("/create", handlePost);

router.get("/:gadgetId/edit", editGet);
router.post("/:gadgetId/edit", editPost);

module.exports = router;
