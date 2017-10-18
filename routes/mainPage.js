const Express = require('express');
const Path = require('path');
let router = Express.Router();

router.get('/', (req, res) => {
  res.status(200).sendFile(Path.resolve(__dirname, '../', 'public', 'index.html'));
});


module.exports = router;
