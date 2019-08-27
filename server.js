// This code is all from activity 20; needs updating!

var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/onionScraper", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.theonion.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every headline within an article tag, and do the following:
    $(".content-meta__headline__wrapper").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find(".sc-1vk1s7l-2")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      // result.img = $(this)
      //   .find("<img srcset="https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_180,q_80,w_320/abwm6w3prjmdcyvoqfxn.jpg 320w, https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_264,q_80,w_470/abwm6w3prjmdcyvoqfxn.jpg 470w, https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_450,q_80,w_800/abwm6w3prjmdcyvoqfxn.jpg 800w, https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_675,q_80,w_1200/abwm6w3prjmdcyvoqfxn.jpg 1200w, https://i.kinja-img.com/gawker-media/image/upload/c_fill,fl_progressive,g_center,h_900,q_80,w_1600/abwm6w3prjmdcyvoqfxn.jpg 1600w, https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_80,q_80,w_80/abwm6w3prjmdcyvoqfxn.jpg 80w" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" sizes="(max-width: 450px) 100vw, (max-width: 850px) 420px, 420px" data-chomp-id="abwm6w3prjmdcyvoqfxn" data-format="jpg" data-default-transform="KinjaCenteredLargeAutoFrozen" data-sizes="(max-width: 450px) 100vw, (max-width: 850px) 420px, 420px" data-relative="true" data-show-background="true" data-poster-src="" data-anim-src="" data-cropped="true" class="dv4r5q-2 bkbWgk">")

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    }); 

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
  .then(function(articles) {
      console.log(articles);
    res.json(articles);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
  .populate("note")
  .then(function(article) {
    res.json(article);
  })
  .catch(function(err) {
  res.json(err);
});
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  db.Note.create(req.body)
  .then(function(note) {
    return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: { note: note._id}}, {new: true});
  })
  .then(function(article) {
    res.json(article);
  }).catch(function(err) {
    res.json(err);
  });
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
