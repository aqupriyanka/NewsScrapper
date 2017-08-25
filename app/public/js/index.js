// The code in add.js handles what happens when the user clicks the "Add a book" button.

// When user clicks add-btn
console.log("index.js loaded");

$(".btn.btn-outline-primary.waves-effect.float-right.saveArticle").on("click",function(e){
    console.log("inside button click");

    e.preventDefault();
    var id = $(this).attr("id");
    console.log("id === ",id);
    $.post("/save/"+id,function(data,status){
      console.log(data);
      window.location.replace(window.location.origin+"/scrape");
    });
});



$("#saveAll").on("click",function(e){
    e.preventDefault();
    $.post("/save",function(data,status){
      console.log(data);
      window.location.replace(window.location.origin);
    });
});

$("#launchModel").on("click",function(){
      console.log("button clicked");
      $(".modal").modal('show');
    });


$(".btn.btn-outline-primary.waves-effect.float-right.saveNotes").on("click",function(e){
    console.log("inside save notes button click");

    e.preventDefault();
    // $("#notes").empty();
    var id = $(this).attr("id");
    console.log("id === ",id);
    // $.get("/articles/"+id,function(data,status){
    //   console.log(data);
    //   console.log(data[0].note);
    //   if(data[0].note){
    //     for(var i=0; i< data[0].note.length; i++){
    //       var noteId = data[0].note[i]._id;
    //       var p = $("<p/>");
    //       p.append("Title :"+data[0].note[i].title);
    //       p.append("Note :"+data[0].note[i].body);
    //       p.attr("data-id",id);
    //       p.attr("note-id",noteId);
    //       p.addClass("note blue-text");

    //       p.append("<button class=\"deleteNote\" data-id="+id+" note-id="+noteId+">&times;</button>");
    //       p.append("<br>");

    //       $("#notes").append(p);
    //       // $("#notes").append("<br>");
    //     }
    //   }
    getNotesForArticle(id, function(data){
      $("#saveNote").attr("data-id",id);
      $(".modal").modal('show');
      $(".modal").css("z-index", "4000");
    })
      

      // window.location.replace(window.location.origin+"/scrape");
    // })
});


function getNotesForArticle(id,callback){
    $("#notes").empty();
    $.get("/articles/"+id,function(data,status){
      console.log(data);
      console.log(data[0].note);
      if(data[0].note){
        for(var i=0; i< data[0].note.length; i++){
          var noteId = data[0].note[i]._id;
          var p = $("<p/>");
          p.append("<b>Title : </b>"+data[0].note[i].title+"  ");
          p.append("<b>Note : </b>"+data[0].note[i].body);
          p.attr("data-id",id);
          p.attr("note-id",noteId);
          p.addClass("note blue-text");

          p.append("<button class=\"deleteNote\" data-id="+id+" note-id="+noteId+">&times;</button>");
          p.append("<br>");

          $("#notes").append(p);
          // $("#notes").append("<br>");
        }
      }
      if(callback)  callback(data);
    });
}


//call delete a node route
$(document).on("click", ".deleteNote", function() {

  var articleId = $(this).attr("data-id");
  var noteId = $(this).attr("note-id");

    $.ajax({
    url: '/delete/'+articleId+"/"+noteId,
    type: 'DELETE',
    success: function(result) {

      getNotesForArticle(articleId);
        // Do something with the result
    }
});
});


$("#saveNote").on("click", function(){
  var id = $(this).attr("data-id");
  console.log('title === ',$("#label").val());
  console.log('body === ',$("#form8").val());
    
  $.ajax({
    method: "POST",
    url: "/articles/" + id,
    data: {
      // Value taken from title input
      title: $("#label").val(),
      // Value taken from note textarea
      body: $("#form8").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
      $("#label").val("");
      $("#form8").val("");
      getNotesForArticle(id);
    });




});


$(".btn.btn-outline-primary.waves-effect.float-right.delArticle").on("click",function(e){
  e.preventDefault();
    var articleId = $(this).attr("id");

    $.ajax({
    method: "DELETE",
    url: "/delete/" + articleId,
    
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      
        window.location.replace(window.location.origin+"/articles");
    });
})



