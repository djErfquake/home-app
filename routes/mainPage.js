const Express = require('express');
const path = require('path');
let router = Express.Router();

router.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../', 'public', 'index.html'));
});


module.exports = router;
