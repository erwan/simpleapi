$(function() {
  "use strict";

  $("#form-request").submit(function(event) {
    $("#result").html("");
    event.preventDefault();
    // Get some values from elements on the page:
    var $form = $( this ),
        docType = $form.find( "input[name='document-type']" ).val(),
        uid = $form.find( "input[name='uid']" ).val(),
        baseUrl = $form.attr( "action" );


    var url = [baseUrl, docType, uid].filter(
      function (val) {
        return val;
      }
    ).join('/');
    //api-call
    var fullUrl = "http://" + window.location.host + url;
    $("#api-call").html(fullUrl);

    // Send the data using post
    var getting = $.get( url, {} );
    getting.done(function(data) {
      $("#result").html(JSON.stringify(data, undefined, 4).replace(/\</g, "&lt;"));
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    });
  });

  $("#form-request-2").submit(function(event) {
    $("#result").html("");
    event.preventDefault();
    // Get some values from elements on the page:
    var $form = $( this ),
        name = $form.find( "input[name='name']" ).val(),
        baseUrl = $form.attr( "action" );

    var url = [baseUrl, name].filter(
      function (val) {
        return val;
      }
    ).join('/');
    //api-call
    var fullUrl = "http://" + window.location.host + url;
    $("#api-call").html(fullUrl);

    // Send the data using post
    var getting = $.get( url, {} );
    getting.done(function(data) {
      $("#result").html(JSON.stringify(data, undefined, 4).replace(/\</g, "&lt;"));
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    });
  });

  $("#form-request-3").submit(function(event) {
    $("#result").html("");
    event.preventDefault();
   // Get some values from elements on the page:
    var $form = $( this ),
      docID = $form.find( "input[name='docid']" ).val(),
      baseUrl = $form.attr( "action" );

    var url = [baseUrl, docID].filter(
      function (val) {
        return val;
      }
    ).join('/');
    //api-call
    var fullUrl = "http://" + window.location.host + url;
    $("#api-call").html(fullUrl);

    // Send the data using post
    var getting = $.get( url, {} );
    getting.done(function(data) {
      $("#result").html(JSON.stringify(data, undefined, 4).replace(/\</g, "&lt;"));
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    });
  });

  $('input[name="document-type"]').autocomplete({
    source: $.map(window.repo_types, function (value, key) {
      return {
        label: key,
        value: key
      }
    }),
    minLength: 0,
    delay: 100
  }).focus(function(){
    $(this).data("uiAutocomplete").search($(this).val());
  });

  $('input[name="name"]').autocomplete({
    source: $.map(window.repo_bookmarks, function (value, key) {
      return {
        label: key,
        value: key
      }
    }),
    minLength: 0,
    delay: 100
  }).focus(function(){
    $(this).data("uiAutocomplete").search($(this).val());
  });

  $('input[name="docid"]').autocomplete({
    source: $.map(window.repo_bookmarks, function (value, key) {
      return {
        label: key,
        value: value
      }
    }),
    minLength: 0,
    delay: 100
  }).focus(function(){
    $(this).data("uiAutocomplete").search($(this).val());
  });

});
