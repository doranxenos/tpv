var QueryBuilder = function(queryString) {
  this._queryString = queryString ? queryString : "";
};

QueryBuilder.prototype = {

  set: function(queryStr) {
    if(typeof queryStr == 'string')
      this._query = this.parse(queryStr);
  },

  get: function() {
    return this._query;
  },

  parse: function(queryString) {
    var components = queryString.split(/\s/g);

    var query = {};

    var l = components.length;
    for(var i=0; i<l; i++) {
      if(components[i].indexOf(":") > -1) {
        var kv = components[i].split(":");
        var k = kv[0];
        kv.splice(0,1);
        query[k] =  kv.join(":");

      } else {
        query[components[i]] = true;
      }
    }

    return query;
  }

};