const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const txnRoutes = require('./routes/txn.routes');
const accountRoutes = require('./routes/account.routes');
const categoryRoutes = require('./routes/category.routes');

const path = require('path');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

mongoose.set('useFindAndModify', false);

//mongoose.connect(process.env.DB, {useNewUrlParser: true})
//mongoose.connect('mongodb://localhost:27017,localhost:27018,localhost:27019/mern-starter', {useNewUrlParser: true, replicaSet: 'rs0'})
//  .then(() => console.log("DB connected"))
//  .catch(err => console.log(err));
const username = process.env.USERNAME
const password = process.env.PASSWORD
//mongoose.connect('mongodb+srv://' + username + ':' + password + '@cluster0.3xxik.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
mongoose.connect('mongodb+srv://zintegy:mongodb@cluster0.3xxik.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods",  "*");


  next();
});

app.use(bodyParser.json());

app.use('/txnApi', txnRoutes);
app.use('/accountApi', accountRoutes);
app.use('/categoryApi', categoryRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});

app.use(express.static(path.join(__dirname, '../frontend/build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});
module.exports = app

