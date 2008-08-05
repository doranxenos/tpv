var TPV = {

  __zIndex: 0,
  _queryBuilder: null,
	_pageSize: 4,
	_currentPage: 0,

  init: function() {
    TPV._queryBuilder = new QueryBuilder();

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
        TPV.execute_search();
      }
    });

    TPV.execute_search(0);
  },

  execute_search: function(page) {
		page = page ? page : 0;
    TPV.clear_thumbs();
    var query = $('#searchBox').attr('value');
    if(query == 'Search Pictures...')
      query = '';

    var qArr = query.split(/\s+/);
		if(qArr.length == 1 && qArr[0] == "")
			qArr = [];

		var toRemove = [];
		for(var i=0; i<qArr.length; i++) {
			if(qArr[i].match(/^\s*$/))
				 toRemove.push(i);
		}
		for(i=0; i<toRemove.length; i++)
			qArr.splice(toRemove[i] - i, 1);

    TPV.build_results_summary.apply(this, TPV.show_thumbs(qArr, page));
  },

  build_results_summary: function(resultCnt, page) {
		page = page ? page : 0;
		var start = page ? page * TPV._pageSize + 1 : 1;
		var end = start - 1 + TPV._pageSize;

		if(end > resultCnt)
			end = resultCnt;

    $('#resultSummary').html("Showing <strong>"+ start +"-"+ end +"</strong> of <strong>"+ resultCnt +"</strong> matching Picture(s)");
  },

  show_thumbs: function(query, page) {
    query = query ? query : [];
		page = page ? page : 0;

		if(page == 0) {

			var matchCnt = 0;

			TPV._matches = [];
			TPV._currentPage = 0;

			var l = TPV.db.length;
			for(var i=0; i<l; i++) {
				var match = 0;

				for(var k in TPV.db[i]) {

					var value = String(TPV.db[i][k]).toLowerCase();

					for(var j=0; j<query.length; j++) {
						if(value == String(query[j]).toLowerCase()) {
							match++;
						}
					}
				}

				if(match >= query.length) {
					TPV._matches.push(TPV.db[i]);
					matchCnt++;
				}
			}

			l = TPV._matches.length > TPV._pageSize ? TPV._pageSize : TPV._matches.length;

			for(i=0; i<l; i++) {
				TPV.append_thumb(TPV._matches[i]);
			}

			if(TPV._matches.length > TPV._pageSize)
				TPV.show_next_page_link();

			return [matchCnt, page];

		} else {
			var thumbCnt = TPV._pageSize;
			if(page * TPV._pageSize + thumbCnt > TPV._matches.length)
				thumbCnt = TPV._matches.length - page * TPV._pageSize;

			for(var i=page * TPV._pageSize; i<page * TPV._pageSize + thumbCnt; i++) {
				TPV.append_thumb(TPV._matches[i]);
			}

			TPV.show_prev_page_link();

			if(TPV._matches.length >  (page+1) * TPV._pageSize)
				TPV.show_next_page_link();

			return [TPV._matches.length, page];
		}
  },

	show_next_page_link: function() {
		var div;

		if($('#pageNavigation').length == 0) {
			div = $(document.createElement('div')).css('clear', 'both').attr('id', 'pageNavigation');
			$('#content').append(div);
		} else {
			div = $('#pageNavigation');
		}

		var np;
		if($('#nextPage').length == 0) {
			np = $(document.createElement('a')).attr('href', '#').html("Next Page").bind('click', function() {
				TPV.execute_search(++TPV._currentPage);
			});
			div.append(np);
		}
	},

	show_prev_page_link: function() {
		var div;

		if($('#pageNavigation').length == 0) {
			div = $(document.createElement('div')).css('clear', 'both').attr('id', 'pageNavigation');
			$('#content').append(div);
		} else {
			div = $('#pageNavigation');
		}

		var pp;
		if($('#prevPage').length == 0) {
			pp = $(document.createElement('a')).attr('href', '#').html("Previous Page").bind('click', function() {
				TPV.execute_search(--TPV._currentPage);
			});
			div.append(pp);
		}
	},

  clear_thumbs: function() {
    $('#content').empty();
  },

  append_thumb: function(dbEntry) {
		var div = $(document.createElement('div')).css('float', 'left');
    var thumb = new Image();
    thumb.src = "pics/"+ dbEntry.src +"__thumb.png";
    div.addClass("thumb");

		var ttl = $(document.createElement('div'));
		ttl.html(dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification);

		div.append(ttl);
		div.append(thumb);
    $('#content').append(div);

    dbEntry.__thumb = div;

    div.bind('click', function(e) {
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

    var span = $(document.createElement('div')).html(dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification +' (50%)');

    var bigLink = $(new Image()).attr('src', 'bigger.gif').bind('click', function() {
      var s = dbEntry.__pic.__pic.__size;
      switch(s) {
        case 0.5:
          dbEntry.__pic.__pic.__size = 0.75;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + "__75%.png";
          ttlbar.children()[0].childNodes[0].src = 'smaller.gif';
          span.html(dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification+' (75%)');
          break;
        case 0.75:
          dbEntry.__pic.__pic.__size = 1.0;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + ".png";
          span.html(dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification+' (100%)');
          ttlbar.children()[0].childNodes[1].src = 'bigger_disabled.gif';
          break;
      }
    });

    var smallLink = $(new Image()).attr('src', 'smaller_disabled.gif').bind('click', function() {
      var s = dbEntry.__pic.__pic.__size;
      switch(s) {
        case 1.0:
          dbEntry.__pic.__pic.__size = 0.75;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + "__75%.png";
          ttlbar.children()[0].childNodes[1].src = 'bigger.gif';
          span.html(dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification+' (75%)');
          break;
        case 0.75:
          dbEntry.__pic.__pic.__size = 0.5;
          dbEntry.__pic.__pic.src = "pics/" + dbEntry.src + "__50%.png";
          ttlbar.children()[0].childNodes[0].src = 'smaller_disabled.gif';
          span.html(dbEntry.mutant + " " + dbEntry.type + " at " + dbEntry.magnification+' (50%)');
          break;
      }
    });

    var closeLink = $(new Image()).attr('src', 'close.gif').bind('click', function() {
			setTimeout(function() { TPV.hide_pic(dbEntry); }, 10);
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

    div.css({'top': Number(window.scrollY + 80)+'px'});

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