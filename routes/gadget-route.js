const router = require("express").Router();
const { handleGet, filter } = require("../controller/gadget-controller");

router.get("/", handleGet);
router.get("/filter", filter);

module.exports = router;
