const router = require("express").Router();
const { getAll, filter } = require("../controller");

router.get("/", getAll);
router.get("/filter", filter);

module.exports = router;
