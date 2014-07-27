// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["h5.rql/index","./util"],function(t,e){function r(t){"/"!==t[0]&&(t="/"+t);var e=t.match(i);this.url=t,this.path=("/"===e[1][0]?"":"/")+e[1],this.queryString=e[2]||"",this.fragment=e[3]||"",this.params={},this.query={},this.rql={},""!==this.queryString&&this.defineGetters()}var i=/^\/(.*?)(?:\?(.*?))?(?:#(.*?))?$/;return r.prototype.defineGetters=function(){Object.defineProperty(this,"query",{enumerable:!0,configurable:!0,get:function(){return this.parseQueryString()},set:function(t){this.query=t}}),Object.defineProperty(this,"rql",{enumerable:!0,configurable:!0,get:function(){return this.parseRqlString()},set:function(t){this.rql=t}})},r.prototype.parseQueryString=function(){delete this.query;for(var t=this.queryString.split("&"),r={},i=0,n=t.length;n>i;++i){var s=t[i],u=s.indexOf("=");if(-1!==u){var h=e.decodeUriComponent(s.substr(0,u)),o=e.decodeUriComponent(s.substr(u+1));r[h]=o}}return this.query=r,r},r.prototype.parseRqlString=function(){return delete this.rql,this.rql=t.parse(this.queryString),this.rql},r});