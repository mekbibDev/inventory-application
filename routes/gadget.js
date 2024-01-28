const router = require("express").Router();
const {
  createGet,
  createPost,
  editGet,
  editPost,
  deleteGadget,
} = require("../controller/gadget");

router.get("/create", createGet);
router.post("/create", createPost);

router.get("/:gadgetId/edit", editGet);
router.post("/:gadgetId/edit", editPost);

router.post("/:gadgetId/:adminKey/delete", deleteGadget);

module.exports = router;
