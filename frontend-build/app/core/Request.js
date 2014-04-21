// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","h5.rql/index","./util"],function(t,e,r){function i(t){"/"!==t[0]&&(t="/"+t);var e=t.match(n);this.url=t,this.path=("/"===e[1][0]?"":"/")+e[1],this.queryString=e[2]||"",this.fragment=e[3]||"",this.params={},this.query={},this.rql={},""!==this.queryString&&this.defineGetters()}var n=/^\/(.*?)(?:\?(.*?))?(?:#(.*?))?$/;return i.prototype.defineGetters=function(){Object.defineProperty(this,"query",{enumerable:!0,configurable:!0,get:function(){return this.parseQueryString()},set:function(t){this.query=t}}),Object.defineProperty(this,"rql",{enumerable:!0,configurable:!0,get:function(){return this.parseRqlString()},set:function(t){this.rql=t}})},i.prototype.parseQueryString=function(){delete this.query;for(var e=this.queryString.split("&"),i={},n=0,s=e.length;s>n;++n){var u=e[n],o=t.indexOf(u,"=");if(-1!==o){var h=r.decodeUriComponent(u.substr(0,o)),f=r.decodeUriComponent(u.substr(o+1));i[h]=f}}return this.query=i,i},i.prototype.parseRqlString=function(){return delete this.rql,this.rql=e.parse(this.queryString),this.rql},i});