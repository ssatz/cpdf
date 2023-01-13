'use strict';
import express from 'express';
import morgan from 'morgan'
import { split } from './app/split.mjs';
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

// Constants
const PORT = 6488;
const HOST = '0.0.0.0';

// App
const app = express();
morgan('combined');
app.use(express.json());

app.post('/split', (req, res) => {
  if (req.body.filename == null || typeof req.body.filename == undefined) {
    console.log('Empty filename');
    return res.status(429).send('Empty file');
  }
  if (req.body.uuid == null || typeof req.body.uuid == undefined) {
    console.log('Empty UUID');
    return res.status(429).send('Empty UUID');
  }
  if (req.body.range == null || typeof req.body.range == undefined) {
    console.log('Empty Range');
    return res.status(429).send('Empty Range');
  }
  if (req.body.isFile == null || typeof req.body.isFile == undefined) {
    console.log('Empty Range');
    return res.status(429).send('Empty Range');
  }
  try {
    split(req.body.filename, req.body.uuid,req.body.range, req.body.isFile, req.body.userId)
    return res.send('ok');
  } catch (error) {
    response
      .status(500)
      .send('something wrong try again!')
  }
});


app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
