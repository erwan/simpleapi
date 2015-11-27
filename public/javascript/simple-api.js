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


    var url = [baseUrl, repository, docType, uid].filter(
      function (val) {
        return val;
      }
    ).join('/');
    //api-call
    var fullUrl = "http://" + window.location.host + url;
    $("#api-call").html("Api call : " + fullUrl);

    // Send the data using post
    var getting = $.get( url, {} );
    getting.done(function(data) {
      $("#result").val(JSON.stringify(data));
    });
  });
});
