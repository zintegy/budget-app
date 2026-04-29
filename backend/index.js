const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const txnRoutes = require('./routes/txn.routes');
const accountRoutes = require('./routes/account.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
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

app.use('/authApi', authRoutes);

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

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

