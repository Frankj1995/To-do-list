//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const dbatlas = process.env.DBATLAS;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-frank:qgud5kldn@cluster0-eus86.mongodb.net/todolistDB', {
  useNewUrlParser: true
});

const itemSchema = {
  name: {
    type: String,
    required: [true, 'Please specify a name for the to-do item.']
  }
};

const Item = mongoose.model('Item', itemSchema);

const listSchema = {
  name: {
    type: String,
    required: (true, 'Please specify a name for your list.')
  },
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {

  List.findOne({
    name: 'Today'
  }, function(err, list) {
    if (!list) {
      const list = new List({
        name: 'Today',
        items: []
      });
      list.save();
      res.redirect('/');
    } else {
      res.render('list', {
        listTitle: list.name,
        newListItems: list.items
      });
    }
  })
});

app.post('/', function(req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: item
  });

  if (listName === 'Today') {
    List.findOne({
      name: listName
    }, function(err, list) {
      list.items.push(newItem);
      list.save();
      res.redirect('/');
    });
  } else {
    List.findOne({
      name: listName
    }, function(err, list) {
      list.items.push(newItem);
      list.save();
      res.redirect('/' + listName);
    });
  }

});

app.post('/delete', function(req, res) {

  List.findOneAndUpdate({
    name: req.body.listName
  }, {
    $pull: {
      items: {
        _id: req.body.checkbox
      }
    }
  }, function(err, list) {
    if (!err) {
      if (req.body.listName === 'Today') {
        res.redirect('/');
      } else {
        res.redirect('/' + req.body.listName);
      }
    }
  });

});

app.get('/:customListName', function(req, res) {
  const customName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customName
  }, function(err, list) {
    if (!err) {
      if (!list) {
        const list = new List({
          name: customName,
          items: []
        });
        list.save();
        res.redirect('/' + req.params.customListName);
      } else {
        res.render('list', {
          listTitle: customName,
          newListItems: list.items
        });
      }
    }
  })
});

app.get('/about', function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});
