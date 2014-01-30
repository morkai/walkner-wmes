define(["underscore","h5.rql/index","./util"],function(e,t,i){function n(e){"/"!==e[0]&&(e="/"+e);var t=e.match(o);this.url=e,this.path=("/"===t[1][0]?"":"/")+t[1],this.queryString=t[2]||"",this.fragment=t[3]||"",this.params={},this.query={},this.rql={},""!==this.queryString&&this.defineGetters()}var o=/^\/(.*?)(?:\?(.*?))?(?:#(.*?))?$/;return n.prototype.defineGetters=function(){Object.defineProperty(this,"query",{enumerable:!0,configurable:!0,get:function(){return this.parseQueryString()},set:function(e){this.query=e}}),Object.defineProperty(this,"rql",{enumerable:!0,configurable:!0,get:function(){return this.parseRqlString()},set:function(e){this.rql=e}})},n.prototype.parseQueryString=function(){delete this.query;for(var t=this.queryString.split("&"),n={},o=0,r=t.length;r>o;++o){var a=t[o],s=e.indexOf(a,"=");if(-1!==s){var l=i.decodeUriComponent(a.substr(0,s)),c=i.decodeUriComponent(a.substr(s+1));n[l]=c}}return this.query=n,n},n.prototype.parseRqlString=function(){return delete this.rql,this.rql=t.parse(this.queryString),this.rql},n});