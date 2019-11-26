var express = require('express');
var router = express.Router();
var test = require('../csv/csv'); // Fait appel à test.js (même dossier)



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/exportCsv', function (req, res) {
  test.generateCSV();
//res.set('Content-Type', 'text/csv');
  res.send("CSV Dispo à la racine du projet, ENJOY :)");
});

module.exports = router;
