// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","h5.rql/index","app/core/util/transliterate","app/i18n","app/user"],function(e,t,r,n,a){"use strict";function i(e,t,r,n){return!e&&t.personellId&&(r+=" ("+t.personellId+")"),r}function l(e,t,r){if(e.id&&e.text)return e;var n=e.lastName&&e.firstName?e.lastName+" "+e.firstName:e.name||e.login||e._id;return{id:e._id,text:t(e,n,r),user:e}}function o(){return{id:"$SYSTEM",text:n("users","select2:users:system"),user:null}}function u(){var e=a.getRootUserData();return{id:e._id,text:e.name||e.login,user:e}}function s(t){var r={};return e.forEach(t,function(e){var t=e.searchName,n=r[t];return n?!1===n.active&&!0===e.active?void(r[t]=e):!0!==n.active||!1!==e.active?!n.email&&e.email?void(r[t]=e):void(n.email&&!e.email||"PHILIPS"!==n.company&&"PHILIPS"===e.company&&(r[t]=e)):void 0:void(r[t]=e)}),e.values(r)}function c(e,t){t=t.trim();var r=/^[0-9]+$/.test(t)?"personellId":"searchName";"searchName"===r&&(t=d.transliterate(t));var n={fields:{},sort:{},limit:20,skip:0,selector:{name:"and",args:[{name:"regex",args:[r,"^"+t]}]}};return n.sort[r]=1,e.Query.fromObject(n)}function d(r,a){a||(a={});var d=a.rqlQueryProvider?a.rqlQueryProvider:c,f=a.userFilter?a.userFilter:null;r.select2(e.extend({openOnEnter:null,allowClear:!0,minimumInputLength:3,placeholder:n("users","select2:placeholder"),ajax:{cache:!0,quietMillis:300,url:function(e){return"/users?"+d(t,e)},results:function(e,t,r){var n=[o(),u()].filter(function(e){return-1!==e.text.toLowerCase().indexOf(r.term.toLowerCase())}),c=n.concat(s(e.collection||[]));f&&(c=c.filter(f));var d=a.textFormatter||i.bind(null,!!a.noPersonnelId);return{results:c.map(function(e){return l(e,d,r)}).sort(function(e,t){return e.text.localeCompare(t.text)})}}}},a));var m=r.val(),v=u();if(m===v.id)r.select2("data",v);else if("$SYSTEM"===m)r.select2("data",o());else if(m&&a.view){var p=a.view.ajax({type:"GET",url:"/users?_id=in=("+m+")"});p.done(function(e){if(e.collection&&e.collection.length){var t=a.textFormatter||i.bind(null,!!a.noPersonnelId),n=e.collection.map(function(e){return l(e,t)});r.select2("data",a.multiple?n:n[0]),a.onDataLoaded&&a.onDataLoaded()}})}return r}return d.defaultRqlQueryProvider=c,d.transliterate=function(e){return r(e.toUpperCase()).replace(/[^A-Z]+/g,"")},d});