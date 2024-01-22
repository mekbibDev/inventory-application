const router = require("express").Router();
const { createGet, createPost } = require("../controller/category");

router.get("/create", createGet);
router.post("/create", createPost);

module.exports = router;
