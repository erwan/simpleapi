$(function() {
  "use strict";

  $("#form-request").submit(function(event) {
    $("#result").html("");
    event.preventDefault();
   // Get some values from elements on the page:
    var $form = $( this ),
      repository = $form.find( "input[name='repository']" ).val(),
      docType = $form.find( "input[name='document-type']" ).val(),
      uid = $form.find( "input[name='uid']" ).val(),
      baseUrl = $form.attr( "action" );


    var url = "http://" + window.location.host + [baseUrl, repository, docType, uid].filter(
      function (val) {
        return val;
      }
    ).join('/');
    //api-call
    $("#api-call").html("Api call : "+ url);

    // Send the data using post
    var getting = $.get( url, {} );
    getting.done(function(data) {
      console.log(data);
      $("#result").html(data);
    });
  });
});
