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
     if ($(".error404-content").length) {
       res.status(404).send("Oops, invalid request.");
     } else {
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

        res.json(reply);
     }
  })
})

app.get('/characteristic/*', (req, res) => {
  let traitToDiscover = req.query.characteristic;
  let reply = {};
  reply.breeds = [];


  request.get(`http://dogtime.com/dog-breeds/characteristics/${traitToDiscover}`, function(err, response, body) {
      let $ = load(body)

      if ($(".error404-content").length) {
        res.status(404).send("Oops, invalid request.");
      } else {
        let breedsThatFitTheBill = $("li.column-list").find("span.post-title").map(function(i, el) {
           return $(this).html();
         }).get();


         for (var i = 0; i < breedsThatFitTheBill.length; i++) {
           reply.breeds.push(breedsThatFitTheBill[i])
         }

         res.json(reply)
      }
  })
})

app.get('/details/*', (req, res) => {
  let breedToDiscover = req.query.dogBreed;
  let reply = {};


  request.get(`http://dogtime.com/dog-breeds/${breedToDiscover}`, function(err, _, body) {
     let $ = load(body)

     if ($(".error404-content").length) {
       res.status(404).send("Oops, invalid request.");
     } else {
       const name = $("header").find('h1').html()
       const image = $("div.article-content").children().attr('src')
       const description = $("header").find('h2').children()[0].children[0].data;

       reply.name = name;
       reply.image = image;
       reply.description = description;


        res.json(reply);
     }   
  })
})

app.get('/allBreeds', (req, res) => {
  let reply = {};
  reply.breeds = [];


  request.get(`http://dogtime.com/dog-breeds/characteristics/small`, function(err, _, body) {
    let $ = load(body)

    let breedsThatFitTheBill = $("li.column-list").find("span.post-title").map(function(i, el) {
       return $(this).html();
     }).get();


     for (var i = 0; i < breedsThatFitTheBill.length; i++) {
       reply.breeds.push(breedsThatFitTheBill[i])
     }

     request.get(`http://dogtime.com/dog-breeds/characteristics/size`, function(err, _, body) {
       let $ = load(body)

       let breedsThatFitTheBill = $("li.column-list").find("span.post-title").map(function(i, el) {
          return $(this).html();
        }).get();


        for (var i = 0; i < breedsThatFitTheBill.length; i++) {
          reply.breeds.push(breedsThatFitTheBill[i])
        }

        request.get(`http://dogtime.com/dog-breeds/characteristics/medium`, function(err, _, body) {
          let $ = load(body)

          let breedsThatFitTheBill = $("li.column-list").find("span.post-title").map(function(i, el) {
             return $(this).html();
           }).get();


           for (var i = 0; i < breedsThatFitTheBill.length; i++) {
             reply.breeds.push(breedsThatFitTheBill[i])
           }

           res.json(reply);
        })
     })
  })
})


//// You know, like, listen on the port or something something darkside
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
