const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const masterRoutes=require('./masterRoutes')
const port=process.env.PORT || 5000
require('dotenv').config();

app.use((req, res, next) => {
  const allowedOrigins = [ 'http://localhost:19006','http://localhost:3000','https://reactnativeserver.vercel.app'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

 app.use('/',masterRoutes)

app.get("/",(req,res)=>{
  res.send("can not Get")
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});