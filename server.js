const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const port = 3000;

app.use(express.static('public/css'));
app.use(express.static('public/js'));

router.get('/',function(req,res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/', router);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))