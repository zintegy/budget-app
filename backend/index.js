const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const txnRoutes = require('./routes/txn.routes');
const accountRoutes = require('./routes/account.routes');
const categoryRoutes = require('./routes/category.routes');
const cors = require('cors')

const path = require('path');
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const app = express();

const port = process.env.PORT || 5004;

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`DB connected (${process.env.NODE_ENV || 'production'})`))
  .catch(err => console.log(err));

mongoose.Promise = global.Promise;

app.use(cors({
  origin: process.env.CORS_ORIGIN.split(',')
}));

app.use(bodyParser.json());

app.use('/txnApi', txnRoutes);
app.use('/accountApi', accountRoutes);
app.use('/categoryApi', categoryRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});

//app.use(express.static(path.join(__dirname, '../frontend/build')));


//app.get('*', (req, res) => {
  //res.sendFile(path.join(__dirname, '../frontend/build/index.html'));});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});
module.exports = app

