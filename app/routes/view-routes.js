// Routes
// =============================================================
module.exports = function(app) {

  // Each of the below routes just handles the HTML page that the user gets sent to.
  var request = require("request");
  var cheerio = require("cheerio");

  var Article = require("../models/Article.js");
  var Note = require("../models/Note.js");

  var db = require("../config/connection.js");

  // index route loads view.html
  app.get("/", function(req, res) {
    res.render("index");
  });

var results = [];

  // A GET request to scrape the echojs website
app.get("/scrapeEchojs", function(req, res) {
      // results = [];

  if(results.length === 0){
  // First, we grab the body of the html with request
	  request("http://www.echojs.com/", function(error, response, html) {
	    // Then, we load that into cheerio and save it to $ for a shorthand selector
	    var $ = cheerio.load(html);
	    // Now, we grab every h2 within an article tag, and do the following:
	    $("article h2").each(function(i, element) {

	      // Save an empty result object
	      var result = {};

	      // Add the text and href of every link, and save them as properties of the result object
	      result.id = i;
	      result.title = $(this).children("a").text();
	      result.link = $(this).children("a").attr("href");


	      results.push(result);

	    });
	      // console.log("results === ",results);

	      res.render("index",{result:results});

  	});
  } else{
      
      res.render("index",{result:results});
  		
  }

  // Tell the browser that we finished scraping the text
  // res.send("Scrape Complete");

});

app.get("/scrape", function(req, res) {
      // results = [];

  if(results.length === 0){
  // First, we grab the body of the html with request
    request("http://www.sandiegouniontribune.com/news/watchdog/elsewhere/", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab every h2 within an article tag, and do the following:
      $("li.trb_outfit_group_list_item").each(function(i, element) {

        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.id = i;
        result.title = $(element).find("a.trb_outfit_relatedListTitle_a").text();
        result.link = "http://www.sandiegouniontribune.com"+ $(element).find("a.trb_outfit_relatedListTitle_a").attr("href");
        result.para = $(element).find("p.trb_outfit_group_list_item_brief").text();
        var img = $(element).find("img.trb_outfit_group_list_item_img").attr("data-baseurl");
        if(img == undefined || img == "" || img == " "){
          img = "/img/dummy-news.jpg";
        }
        result.img = img;



        results.push(result);

      });
        // console.log("results === ",results);

        res.render("index",{result:results});

    });
  } else{
      
      res.render("index",{result:results});
      
  }

  // Tell the browser that we finished scraping the text
  // res.send("Scrape Complete");

});

app.post("/save",function(req,res){
	var count = results.length;
	var i=0;
	for(var j=0; j< results.length;j++){
		var entry = new Article(results[j]);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
          i++;
        }
      });
	}
	results=[];
	res.end(i);
})


app.post("/save/:id",function(req,res){

	var entry = new Article(results[req.params.id]);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
          res.send(err);
        }
        // Or log the doc
        else {
          console.log(doc);
          results.splice( req.params.id, 1 );

          res.end();

        }
      });


})

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {

  Article.find({},function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or, send our results to the browser, which will now include the books stored in the library
      else {
        res.render("articles",{result:doc});
      }
    });
  // TODO: Finish the route so it grabs all of the articles


});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {


  // TODO
  // ====

  // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included

  Article.find({"_id": (req.params.id)})
    // ..and string a call to populate the entry with the books stored in the library's books array
    // This simple query is incredibly powerful. Remember this one!
    .populate("note")
    // Now, execute that query
    .exec(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or, send our results to the browser, which will now include the books stored in the library
      else {
        res.json(doc);
      }
    });


});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  console.log("ID ==== ",req.params);
  console.log("Note body ==== ",req.body);


  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      Article.findOneAndUpdate({"_id": (req.params.id)}, { $push: { "note": doc._id } }, { new: true }, function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          res.send(newdoc);
        }
      });
    }
  });
  // TODO
  // ====

  // save the new note that gets posted to the Notes collection

  // then find an article from the req.params.id

  // and update it's "note" property with the _id of the new note


});

//Delete a Node
app.delete("/delete/:id/:noteId", function(req, res) {
  console.log("ID ==== ",req.params);
  console.log("Note body ==== ",req.body);

  var id = req.params.id;
  var noteId = req.params.noteId;

  // var newNote = new Note(req.body);
  // newNote.save(function(error, doc) {
    // Send any errors to the browser
    // if (error) {
      // res.send(error);
    // }
    // Otherwise
    // else {
      // Find our user and push the new note id into the User's notes array
      Article.findOneAndUpdate({"_id": (req.params.id)}, { $pull: { "note": noteId } },function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          // res.send(newdoc);
          console.log(newdoc);
          Note.remove({"_id":noteId}, function(err,doc){
            if(err){
              res.send(err);

            } else{
              res.send(newdoc);
            }
          });
        }
      });
  //   }
  // });

});

//Delete an Article
app.delete("/delete/:id", function(req,res){
  console.log("inside delete article");
  Article.remove({"_id":req.params.id},function(err,doc){
    if(err){
      res.send(err);
    } else{
      res.send(doc);
    }
  });
});




};
