define(["underscore","jquery","app/i18n","app/viewport","../views/ActionFormView","app/core/templates/jumpAction"],function(e,n,r,t,i,a){function l(e){return e.paginationData?e.paginationData.get("totalCount"):e.length}function o(i,a,l){var o=l[0].rid;if(o.readOnly)return!1;var s=parseInt(o.value,10);if(isNaN(s)||0>=s)return o.value="",!1;o.readOnly=!0,o.value=s;var u=l.find(".fa").removeClass("fa-search").addClass("fa-spinner fa-spin"),d=i.promised(n.ajax({url:e.result(a,"url")+";rid",data:{rid:s}}));return d.done(function(e){i.broker.publish("router.navigate",{url:a.genClientUrl()+"/"+e,trigger:!0})}),d.fail(function(){t.msg.show({type:"error",time:2e3,text:r(a.getNlsDomain(),"MSG:jump:404",{rid:s})}),u.removeClass("fa-spinner fa-spin").addClass("fa-search"),o.readOnly=!1,o.select()}),!1}return{add:function(e,n){return{label:r.bound(e.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",href:e.genClientUrl("add"),privileges:n||e.getPrivilegePrefix()+":MANAGE"}},edit:function(e,n){return{label:r.bound(e.getNlsDomain(),"PAGE_ACTION:edit"),icon:"edit",href:e.genClientUrl("edit"),privileges:n||e.getPrivilegePrefix()+":MANAGE"}},"delete":function(e,n){return{label:r.bound(e.getNlsDomain(),"PAGE_ACTION:delete"),icon:"times",href:e.genClientUrl("delete"),privileges:n||e.getPrivilegePrefix()+":MANAGE",callback:function(n){0===n.button&&(n.preventDefault(),i.showDeleteDialog({model:e}))}}},"export":function(n,t,i,a){return t.listenTo(i,"sync",function(){var r=l(i),t=n.$(".page-actions .export").attr("href",e.result(i,"url")+";export?"+i.rqlQuery).toggleClass("disabled",!r).removeClass("btn-default btn-warning");r>=1e4?t.removeClass("btn-default").addClass("btn-warning"):t.removeClass("btn-warning").addClass("btn-default")}),{label:r.bound(i.getNlsDomain(),"PAGE_ACTION:export"),icon:"download",type:l(i)>=1e4?"warning":"default",href:e.result(i,"url")+";export?"+i.rqlQuery,privileges:a||i.getPrivilegePrefix()+":VIEW",className:"export"+(i.length?"":" disabled")}},jump:function(e,n){return{template:function(){return a({nlsDomain:n.getNlsDomain()})},afterRender:function(r){var t=r.find("form");t.submit(o.bind(null,e,n,t))}}}}});