var TPV = {

	__zIndex: 0,

	init: function() {
		TPV.show_thumbs();
	},

	show_thumbs: function(query) {
		query = query ? query : {};

		var l = TPV.db.length;
		for(var i=0; i<l; i++) {
			var match = true;
			for(var k in query) {
				if(TPV.db[k] == null || TPV.db[k] != query[k]) {
					match = false;
					break;
				}
			}

			if(match) {
				TPV.append_thumb(TPV.db[i]);
			}
		}
	},

	append_thumb: function(dbEntry) {
		var thumb = new Image();
		thumb.src = "pics/"+ dbEntry.src +"__thumb.png";
		$(thumb).addClass("thumb");
		$('#content').append($(thumb));

		$(thumb).bind('click', function(e) {
			if($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				this.__pic.remove();
				delete this.__pic;

			} else {
				$(this).addClass('selected');
				this.__pic = TPV.show_pic(dbEntry);

			}
		});
	},

	show_pic: function(dbEntry) {
		var div = $(document.createElement('div'));
		div.addClass('floating_pic');
		div.css('zIndex', TPV.__zIndex++);

		div.bind('mousedown', function() {
			$(this).css('zIndex', TPV.__zIndex++);
		});

		var pic = new Image();
		pic.src = "pics/" + dbEntry.src + ".png";

		div.append(pic);

		$(document.body).append(div);
		div.draggable();

		return div;
	},

	hide_pic: function(dbEntry) {

	}

};