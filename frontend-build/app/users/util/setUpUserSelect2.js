// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","h5.rql/index","app/i18n","app/user"],function(e,t,r,n){"use strict";function l(e){if(e.id&&e.text)return e;var t=e.lastName&&e.firstName?e.lastName+" "+e.firstName:e.name||e.login||e._id,r=t;return e.personellId&&(r+=" ("+e.personellId+")"),{id:e._id,text:r,user:e}}function i(){return{id:"$SYSTEM",text:r("users","select2:users:system"),user:null}}function a(){var e=n.getRootUserData();return{id:e._id,text:e.name||e.login,user:e}}function s(e,t){t=t.trim();var r=/^[0-9]+$/.test(t)?"personellId":"lastName",n={fields:{},sort:{},limit:20,skip:0,selector:{name:"and",args:[{name:"regex",args:[r,"^"+t,"i"]}]}};return n.sort[r]=1,e.Query.fromObject(n)}function o(n,o){var u=o&&o.rqlQueryProvider?o.rqlQueryProvider:s,c=o&&o.userFilter?o.userFilter:null;n.select2(e.extend({openOnEnter:null,allowClear:!0,minimumInputLength:3,placeholder:r("users","select2:placeholder"),ajax:{cache:!0,quietMillis:300,url:function(e){return"/users?"+u(t,e)},results:function(e,t,r){var n=[i(),a()].filter(function(e){return-1!==e.text.toLowerCase().indexOf(r.term.toLowerCase())}),s=n.concat(e.collection||[]);return c&&(s=s.filter(c)),{results:s.map(l).sort(function(e,t){return e.text.localeCompare(t.text)})}}}},o));var d=n.val(),f=a();if(d===f.id)n.select2("data",f);else if("$SYSTEM"===d)n.select2("data",i());else if(d&&o.view){var m=o.view.ajax({type:"GET",url:"/users?_id="+d});m.done(function(e){e.collection&&e.collection.length&&(n.select2("data",l(e.collection[0])),o.onDataLoaded&&o.onDataLoaded())})}return n}return o.defaultRqlQueryProvider=s,o});