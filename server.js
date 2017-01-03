#!/usr/bin/env node
"use strict";

//Setting Up App
const express = require('express');
const app = express()
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');
const { load } = require('cheerio')



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json())

//// Parse and return characteristics ////
app.get('/dogbreed/*', (req, res) => {
  let breedToDiscover = req.query.breed;
  let reply = {};
  reply.characteristics = [];

  request.get(`http://dogtime.com/dog-breeds/${breedToDiscover}`, function(err, _, body) {
     let $ = load(body)

     let characteristicsDomElements = $(".child-characteristic").find("span.characteristic").map(function(i, el) {
        return $(this).html();
      }).get();

      let starDomElements = $(".child-characteristic").find("span.star").map(function(i, el) {
         return $(this).html();
       }).get();

      for (var i = 0; i < characteristicsDomElements.length; i++) {
        let propName = characteristicsDomElements[i].split(' ').join('');
        const singleReply = {
          traitId: i,
          trait: characteristicsDomElements[i],
          value: starDomElements[i]
        }
        reply.characteristics.push(singleReply)
      }

      res.json(reply)
  })
})


//// You know, like, listen on the port or something something darkside
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
