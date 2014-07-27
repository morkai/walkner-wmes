// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/viewport","../views/ActionFormView","app/core/templates/jumpAction"],function(e,n,r,t,i){function a(e){return e.paginationData?e.paginationData.get("totalCount"):e.length}function l(t,i,a){var l=a[0].rid;if(l.readOnly)return!1;var o=parseInt(l.value,10);if(isNaN(o)||0>=o)return l.value="",!1;l.readOnly=!0,l.value=o;var s=a.find(".fa").removeClass("fa-search").addClass("fa-spinner fa-spin"),u=t.ajax({url:e.result(i,"url")+";rid",data:{rid:o}});return u.done(function(e){t.broker.publish("router.navigate",{url:i.genClientUrl()+"/"+e,trigger:!0})}),u.fail(function(){r.msg.show({type:"error",time:2e3,text:n(i.getNlsDomain(),"MSG:jump:404",{rid:o})}),s.removeClass("fa-spinner fa-spin").addClass("fa-search"),l.readOnly=!1,l.select()}),!1}return{add:function(e,r){return{label:n.bound(e.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",href:e.genClientUrl("add"),privileges:r||e.getPrivilegePrefix()+":MANAGE"}},edit:function(e,r){return{label:n.bound(e.getNlsDomain(),"PAGE_ACTION:edit"),icon:"edit",href:e.genClientUrl("edit"),privileges:r||e.getPrivilegePrefix()+":MANAGE"}},"delete":function(e,r){return{label:n.bound(e.getNlsDomain(),"PAGE_ACTION:delete"),icon:"times",href:e.genClientUrl("delete"),privileges:r||e.getPrivilegePrefix()+":MANAGE",callback:function(n){0===n.button&&(n.preventDefault(),t.showDeleteDialog({model:e}))}}},"export":function(r,t,i,l){return t.listenTo(i,"sync",function(){var n=a(i),t=r.$(".page-actions .export").attr("href",e.result(i,"url")+";export?"+i.rqlQuery).toggleClass("disabled",!n).removeClass("btn-default btn-warning");n>=1e4?t.removeClass("btn-default").addClass("btn-warning"):t.removeClass("btn-warning").addClass("btn-default")}),{label:n.bound(i.getNlsDomain(),"PAGE_ACTION:export"),icon:"download",type:a(i)>=1e4?"warning":"default",href:e.result(i,"url")+";export?"+i.rqlQuery,privileges:l||i.getPrivilegePrefix()+":VIEW",className:"export"+(i.length?"":" disabled")}},jump:function(e,n){return{template:function(){return i({nlsDomain:n.getNlsDomain()})},afterRender:function(r){var t=r.find("form");t.submit(l.bind(null,e,n,t))}}}}});