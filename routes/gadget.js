const router = require("express").Router();
const { createGet, handlePost } = require("../controller/gadget");

router.get("/create", createGet);
router.post("/create", handlePost);

module.exports = router;
