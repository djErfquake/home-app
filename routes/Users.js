const Express = require('express');
let router = Express.Router();

router.get('/', (req, res) => {
  res.status(200).send("10-4");
});


module.exports = router;
