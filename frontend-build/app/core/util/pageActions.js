define(["underscore","jquery","app/i18n","app/viewport","../views/ActionFormView","app/core/templates/jumpAction","app/core/templates/exportAction"],function(e,t,r,n,a,i,o){"use strict";function l(e,t,r,n){if(!1===r)return null;var a=t.model||t.constructor,i=a.can&&(a.can[e]||a.can.manage);return i?i.bind(a,t,e):r||t.getPrivilegePrefix()+":"+(n||"MANAGE")}function u(e,a){a||(a=n.msg.show({type:"warning",text:r("core","MSG:EXPORTING"),sticky:!0}));var i=t.ajax({url:e});return i.fail(function(){n.msg.hide(a,!0),n.msg.show({type:"error",time:2500,text:r("core","MSG:EXPORTING_FAILURE")})}),i.done(function(e){n.msg.hide(a),window.open("/express/exports/"+e)}),i}function c(e,t,n){var a=e.getNlsDomain();return r.bound(r.has(a,t)?a:"core",t,n)}return{add:function(e,t){return{id:"add",label:c(e,"PAGE_ACTION:add"),icon:"plus",href:e.genClientUrl("add"),privileges:l("add",e,t)}},edit:function(e,t){return{id:"edit",label:c(e,"PAGE_ACTION:edit"),icon:"edit",href:e.genClientUrl("edit"),privileges:l("edit",e,t)}},delete:function(t,r,n){return n||(n={}),{id:"delete",label:c(t,"PAGE_ACTION:delete"),icon:"times",href:t.genClientUrl("delete"),privileges:l("delete",t,r),callback:function(r){r&&0!==r.button||(r&&r.preventDefault(),a.showDeleteDialog(e.defaults({model:t},n)))}}},export:function(r,n,a,i){var p={layout:r,page:n,collection:a||n&&n.collection||null,privileges:i,maxCount:6e4};1===arguments.length&&e.assign(p,r);var d=function(){var t,r=(t=p.collection).paginationData?t.paginationData.get("totalCount"):t.length,n=e.result(p.collection,"url"),a=n.indexOf("?");-1===a?n+=";export.${format}?"+p.collection.rqlQuery:n=n.substring(0,a)+";export.${format}"+n.substring(a);var i=[{type:"csv",href:n.replace("${format}","csv")}];return window.XLSX_EXPORT&&r<p.maxCount/2&&i.push({type:"xlsx",href:n.replace("${format}","xlsx")}),(p.template||o)({type:r>=p.maxCount/2?"danger":r>=p.maxCount/4?"warning":"default",formats:i,disabled:r>=p.maxCount||0===r,label:p.label||c(p.collection,"PAGE_ACTION:export")})};return p.page.listenTo(p.collection,"sync",function(){p.layout.$(".page-actions-export").replaceWith(d()),s(p.layout.$(".page-actions-export"))}),{id:"export",template:d,privileges:l("view",p.collection,p.privileges,"VIEW"),callback:p.callback,afterRender:s};function s(e){!function(e){var t=e.find(".page-actions-export");t.hasClass("btn-group")&&(t=t.find('a[data-export-type="csv"]'));if(!t.length)return;var r=t.prop("href");t.prop("href","javascript:void(0)"),t.on("click",function(e){e.preventDefault(),window.open(r)})}(e),function(e){var r=e.find('a[data-export-type="xlsx"]');if(!r.length)return;r.each(function(){var e=t(this),r=e.prop("href");e.prop("href","javascript:void(0)"),e.on("click",function(e){e.preventDefault(),u(r)})})}(e)}},exportXlsx:u,jump:function(t,r,a){return a=e.assign({mode:"rid",pattern:"^ *[0-9]+ *$",autoFocus:!window.IS_MOBILE,width:150,browse:!1},a),{id:"jump",template:function(){return i({title:a.title||c(r,"PAGE_ACTION:jump:title"),placeholder:a.placeholder||c(r,"PAGE_ACTION:jump:placeholder"),autoFocus:a.autoFocus,pattern:a.pattern,width:a.width})},afterRender:function(i){var o=i.find("form");o.submit(function(t,r,a,i){var o=a[0].phrase;if(o.readOnly)return!1;var l=i.prepareId?i.prepareId(o.value):o.value;o.readOnly=!0;var u=a.find(".fa").removeClass("fa-search").addClass("fa-spinner fa-spin"),p=t.ajax("rid"===i.mode?{url:e.result(r,"url")+";rid",data:{rid:l}}:{method:"GET",url:e.result(r,"url")+"/"+l+"?select(rid)"});return p.done(function(e){var n=l;"rid"===i.mode?n=e:e._id?n=e._id:e.rid&&(n=e.rid),t.broker.publish("router.navigate",{url:r.genClientUrl()+"/"+n,trigger:!0})}),p.fail(function(){n.msg.show({type:"error",time:2e3,text:c(r,"MSG:jump:404",{rid:l})}),u.removeClass("fa-spinner fa-spin").addClass("fa-search"),o.readOnly=!1,o.select()}),!1}.bind(null,t,r,o,a))}}}}});