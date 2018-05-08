// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/broker","app/pubsub","app/viewport","app/core/View","app/planning/util/contextMenu","app/printers/templates/pageAction"],function(e,n,t,r,i,a,l,o,s){"use strict";function d(e,n){null===f?u(e,n):setTimeout(n,1,c(e))}function c(n){return n&&f?f.filter(function(t){return e.isEmpty(t.tags)||e.includes(t.tags,n)}):f||[]}function u(t,r){var a=n.ajax({url:"/printing/printers"});i.subscribe("printing.printers.**",function(n,t){if(null!==f)switch(t){case"printing.printers.added":f.push(n.model),p();break;case"printing.printers.deleted":f=f.filter(function(e){return e._id!==n.model._id});break;case"printing.printers.edited":var r=e.find(f,function(e){return e._id===n.model._id});r?e.assign(r,n.model):f.push(n.model),p()}}),a.fail(function(){r([])}),a.done(function(e){f=e.collection||[],r(c(t))})}function p(){f.sort(function(e,n){return e.label.localeCompare(n.label)})}var f=null;return l.extend({},{contextMenu:function(e,n){e.contextMenu.hide=!1;var i=r.sandbox();i.subscribe("planning.contextMenu.hidden",function(){i.destroy(),i=null,e.contextMenu.onCancel&&e.contextMenu.onCancel()}),d(e.contextMenu.tag,function(r){if(i){if(!r.length)return n(null);var a=[t("printers","menu:header"),{label:t("printers","menu:browser"),handler:n.bind(null,null)}].concat(r.map(function(e){return{label:e.label,handler:n.bind(null,e._id)}}));o.show(e.contextMenu.view,e.pageY-40,e.pageX-15,a)}})},listAction:function(e,t){var r=n(e.currentTarget).addClass("disabled").prop("disabled",!0);e.contextMenu=e.listAction,e.contextMenu.onCancel=function(){r.removeClass("disabled").prop("disabled",!1)},this.contextMenu(e,function(n){e.contextMenu.onCancel(),t(n)})},pageAction:function(e,r){var i=e.view.model||e.view.collection,l=i.getNlsDomain?i.getNlsDomain():i.nlsDomain||"core",o="PAGE_ACTION:print",u=e.label||(t.has(l,o)?t(l,o):t("core",o)),p=c(e.tag);return 0===p.length?{label:u,icon:"print",callback:function(t){function i(){s.destroy(),s=null,o.removeClass("fa-spinner fa-spin").addClass("fa-print"),l.prop("disabled",!1).removeClass("disabled")}if(f&&0===c(e.tag).length)return r(null);var l=n(t.currentTarget).find(".btn").addClass("disabled").prop("disabled",!0),o=l.find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),s=e.view.broker.sandbox();s.subscribe("router.dispatching",i),d(e.tag,function(n){if(s){if(!n.length)return r(null);a.currentLayout.setActions(e.view.actions,e.view),a.currentLayout.$(".page-actions-printers").find(".btn").click()}})}}:{template:function(){return s({label:u,printers:p})},callback:function(e){var t=n(e.currentTarget);t.data("printers-bound")||(t.data("printers-bound",!0),t.find(".dropdown-menu").on("click","a",function(e){r(e.currentTarget.dataset.printerId||null)}))}}},selectField:function(r,i){function a(e){l.addClass("has-required-select2"),r.$id(i.id).removeClass("form-control").prop("placeholder",t("printers","select:placeholder")).prop("readonly",!1).prop("required",!0).select2({width:"100%",data:[{id:"browser",text:t("printers","select:browser")}].concat(e.map(function(e){return{id:e._id,text:e.label}}))})}i=e.assign({id:"printer",label:t("printers","select:label")},i);var l=r.$id(i.id||"printer");if(!l.length){var o=r.$(".form-actions");if(!o.length)return;l=n("<div></div>").insertBefore(o)}l.prop("id","").addClass("form-group"),l.append('<label for="'+r.idPrefix+"-"+i.id+'">'+i.label+"</label>"),l.append('<input class="form-control" value="" readonly id="'+r.idPrefix+"-"+i.id+'" placeholder="'+t("printers","select:browser")+'">');var s=c(i.tag);if(f&&0===s.length)return void l.remove();null===f?d(i.tag,function(e){if(0!==r.$id(i.id).length)return 0===e.length?void l.remove():void a(e)}):a(s)}})});