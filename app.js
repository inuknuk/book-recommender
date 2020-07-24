var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
var session = driver.session();
app.get('/', function (req, res) {
    session
        .run('MATCH(n:Movie) RETURN n LIMIT 10')
        .then(function (result) {
            var movieArr = [];
            result.records.forEach(function (record) {
                movieArr.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title,
                    year: record._fields[0].properties.year
                });
            });
            res.render('index', {
                movies: movieArr
            });
        })
        .catch(function (err) {
            console.log(err);
        })

});

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;