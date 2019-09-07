// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $(".article-container").append("<div class='article' data-id='" + data[i]._id + 
    "'>" + "<img src='"+ data[i].img + "'>" + "<br> <a href = '"+ data[i].link +"'> <h1>"+
    data[i].title + "</h1> </div>");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", ".article", function () {
  // Empty the notes from the note section
  $("#save-notes").empty();
  // Save the id from the article tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data); 
      // The title of the article
      $("#save-notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#save-notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#save-notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#save-notes").append("<button data-id='" + data._id + "'id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        for (i = 0; i < data.note.length; i++) {
          $("#view-notes").append("<h3>" + data.note[i].title + "</h3> <p>" + data.note[i].body + "</p>")
        }
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log("savenote clicked");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#view-notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


//on click event for 'Scrape New Articles!' button
$(".scrape-new").on("click", function() {
    $.getJSON("/scrape", function(data) {
      displayResults(data);
    });
});


//on click event for 'Clear Articles!' button
$(".clear").on("click", function () {
    $.getJSON("/saved", function(data) {
      clearImmediate(data); //is this what I want to use? How do I clear the saved articles? 
    });
});