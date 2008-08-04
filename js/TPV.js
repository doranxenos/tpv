var TPV = {

  __zIndex: 0,
  _queryBuilder: null,

  init: function() {
    TPV._queryBuilder = new QueryBuilder();

    TPV.build_results_summary(TPV.show_thumbs());

    $('#searchBox').bind('focus', function() {
      if($('#searchBox').attr('value') == 'Search Pictures...') {
        $('#searchBox').attr('value', '');
      }
    });

    $('#searchBox').bind('blur', function() {
      if($('#searchBox').attr('value') == '') {
        $('#searchBox').attr('value', 'Search Pictures...');
      }
    });

    $('#searchBox').bind('keydown', function(e) {
      if(e.which == 13) {
        TPV.clear_thumbs();
        TPV._queryBuilder.set($('#searchBox').attr('value'));
        TPV.build_results_summary(TPV.show_thumbs(TPV._queryBuilder.get()));
      }
    });
  },

  build_results_summary: function(resultCnt) {
    $('#resultSummary').html("Found <strong>"+ resultCnt +"</strong> Picture(s)");
  },

  show_thumbs: function(query) {
    query = query ? query : {};

    var matchCnt = 0;

    var l = TPV.db.length;
    for(var i=0; i<l; i++) {
      var match = true;
      for(var k in query) {
        if(TPV.db[i][k] == null || TPV.db[i][k] != query[k]) {
          match = false;
          break;
        }
      }

      if(match) {
        TPV.append_thumb(TPV.db[i]);
        matchCnt++;
      }
    }

    return matchCnt;
  },

  clear_thumbs: function() {
    $('#content').empty();
  },

  append_thumb: function(dbEntry) {
    var thumb = new Image();
    thumb.src = "pics/"+ dbEntry.src +"__thumb.png";
    thumb.title = dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification;
    $(thumb).addClass("thumb");
    $(thumb).tooltip({ showURL: false, fixPNG: true });
    $('#content').append($(thumb));

    dbEntry.__thumb = $(thumb);

    $(thumb).bind('click', function(e) {
      if($(this).hasClass('selected')) {
        TPV.hide_pic(dbEntry);

      } else {
        TPV.show_pic(dbEntry);

      }
    });
  },

  show_pic: function(dbEntry) {
    dbEntry.__thumb.addClass('selected');

    var div = $(document.createElement('div'));
    div.addClass('floating_pic');
    div.css('zIndex', TPV.__zIndex++);

    var ttlbar = $(document.createElement('div'));
    ttlbar.addClass('floating_ttl');
    ttlbar.css({'height': '16px'});

    var span = $(document.createElement('div')).html('50%');

    var bigLink = $(new Image()).attr('src', 'bigger.gif').bind('click', function() {
      var s = dbEntry.__pic.__pic.__size;
      switch(s) {
        case 0.5:
          dbEntry.__pic.__pic.__size = 0.75;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + "__75%.png";
          span.html('75%');
          break;
        case 0.75:
          dbEntry.__pic.__pic.__size = 1.0;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + ".png";
          span.html('100%');
          break;
      }
    });

    var smallLink = $(new Image()).attr('src', 'smaller.gif').bind('click', function() {
      var s = dbEntry.__pic.__pic.__size;
      switch(s) {
        case 1.0:
          dbEntry.__pic.__pic.__size = 0.75;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + "__75%.png";
          span.html('75%');
          break;
        case 0.75:
          dbEntry.__pic.__pic.__size = 0.5;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + "__50%.png";
          span.html('50%');
          break;
      }
    });

    var closeLink = $(new Image()).attr('src', 'close.gif').bind('click', function() {
      TPV.hide_pic(dbEntry);
    });;

    var sizeWrapper = $(document.createElement('div'));
    sizeWrapper.css({ 'float': 'left' });

    sizeWrapper.append(smallLink.css('marginRight', '3px').attr('title', "Decrease Picture Size").tooltip({showURL: false}));
    sizeWrapper.append(bigLink.css('margin', '0px 3px').attr('title', "Increase Picture Size").tooltip({showURL:false}));
    ttlbar.append(sizeWrapper);
    ttlbar.append(closeLink.css({'marginLeft': '3px', 'display': 'block', 'float':'right'}).attr('title', "Close Picture").tooltip({showURL:false}));

    ttlbar.append(span);

    div.bind('mousedown', function() {
      $(this).css('zIndex', TPV.__zIndex++);
    });

    div.__pic = new Image();
    div.__pic.src = "pics/" + dbEntry.src + "__50%.png";
    div.__pic.__size = 0.5;

    div.append(ttlbar);
    div.append(div.__pic);

    $(document.body).append(div);
    div.draggable();

    dbEntry.__pic = div;
  },

  hide_pic: function(dbEntry) {
    if(dbEntry.__pic) {
      dbEntry.__pic.remove();
      delete dbEntry.__pic;
      dbEntry.__thumb.removeClass('selected');
    }
  }

};