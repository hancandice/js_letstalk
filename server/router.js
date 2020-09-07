const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("le serveur est opérationnel.");
});

module.exports = router;
