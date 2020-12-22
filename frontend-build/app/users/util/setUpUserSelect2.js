define(["underscore","h5.rql/index","app/core/util/transliterate","app/i18n","app/user"],function(e,t,r,n,a){"use strict";function i(e,t,r){return e.id&&e.text?e:(e.name=e.lastName||e.firstName?(e.lastName+" "+e.firstName).trim():e.name||e.login||e._id,{id:e._id,text:t(e,e.name,r),user:e})}function o(){return{id:"$SYSTEM",text:n("users","select2:users:system"),user:null}}function l(){var e=a.getRootUserData();return{id:e._id,text:e.name||e.login,user:e}}function c(t){var r={};return e.forEach(t,function(e){var t=e.searchName,n=r[t];n&&(!1!==n.active||!0!==e.active)?!0===n.active&&!1===e.active||(n.email||!e.email?n.email&&!e.email||"PHILIPS"!==n.company&&"PHILIPS"===e.company&&(r[t]=e):r[t]=e):r[t]=e}),e.values(r)}function u(e,t,r){t=t.trim();var n=/^[0-9]+$/.test(t)?"personnelId":"searchName";"searchName"===n&&(t=f.transliterate(t));var a={fields:{},sort:{},limit:20,skip:0,selector:{name:"and",args:[{name:"regex",args:[n,"^"+t]}]}};return r.activeOnly&&a.selector.args.push({name:"eq",args:["active",!0]}),a.sort[n]=1,r.rqlQueryDecorator&&r.rqlQueryDecorator(a,t,r),e.Query.fromObject(a)}function s(e){return e.textFormatter||function(e,t,r,n){return!e&&t.personnelId&&(r+=" ("+t.personnelId+")"),r}.bind(null,!!e.noPersonnelId)}function f(r,d){if(!r.length)return r;d||(d={});var m=s(d),p={openOnEnter:null,allowClear:!0,minimumInputLength:3,placeholder:n("users","select2:placeholder")};if(d.collection)d.minimumInputLength=0,d.placeholder=" ",d.data=function(e){var t=s(e),r=[];return(e.currentUserInfo||[]).forEach(function(t){e.collection.get(t[a.idProperty])||r.push({id:t[a.idProperty],text:t.label,user:t})}),e.collection.forEach(function(e){r.push(i(e.toJSON(),t))}),r.sort(function(e,t){return e.text.localeCompare(t.text,void 0,{ignorePunctuation:!0,sensitivity:"base"})}),r}(d);else{var v=d.rqlQueryProvider?d.rqlQueryProvider:u,y=d.userFilter?d.userFilter:null;p.ajax={cache:!0,quietMillis:300,url:function(e){return"/users?"+v(t,e,d)},results:function(e,t,r){var n=[o(),l()].filter(function(e){return-1!==e.text.toLowerCase().indexOf(r.term.toLowerCase())}),a=!1===d.filterDuplicates?n.concat(e.collection||[]):n.concat(c(e.collection||[]));return y&&(a=a.filter(y)),{results:a.map(function(e){return i(e,m,r)}).sort(function(e,t){return e.text.localeCompare(t.text)})}}}}if(r.select2(e.assign(p,d)),d.collection){var h=r.data("select2"),x=h.destroy;h.destroy=function(){d.collection.off(null,null,r),x.apply(h,arguments)},d.collection.once("reset add change remove",function(){f(r,d)})}var g=r.val(),I=l(),P=d.currentUserInfo;if(P)Array.isArray(P)?r.select2("data",P.map(function(e){return{id:e.id,text:e.label,user:e}})):r.select2("data",{id:P.id,text:P.label,user:P});else if(g===I.id)r.select2("data",I);else if("$SYSTEM"===g)r.select2("data",o());else if(g&&d.view){d.view.ajax({type:"GET",url:"/users?_id=in=("+g+")"}).done(function(e){if(e.collection&&e.collection.length){var t=e.collection.map(function(e){return i(e,m)});r.select2("data",d.multiple?t:t[0]),d.onDataLoaded&&d.onDataLoaded()}})}return r}return f.defaultRqlQueryProvider=u,f.filterDuplicates=c,f.transliterate=function(e){return r(e.toUpperCase()).replace(/[^A-Z0-9]+/g,"")},f.getUserInfo=function(e){var t=e.select2("data"),r=e.data("select2"),n=a.getInfo.decorators.concat(r&&r.opts.userInfoDecorators||[]);if(Array.isArray(t))return t.map(function(e){var t={},r=e.user||{};return t[a.idProperty]=e.id,t.label=e.text,n.forEach(function(e){e(t,r)}),t});if(t){var i={},o=t.user||{};return i[a.idProperty]=t.id,i.label=t.text,n.forEach(function(e){e(i,o)}),i}return null},f});