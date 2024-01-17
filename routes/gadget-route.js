const router = require("express").Router();
const { handleGet } = require("../controller/gadget-controller");
router.get("/", handleGet);

module.exports = router;
