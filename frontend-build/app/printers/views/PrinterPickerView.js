define(["underscore","jquery","app/i18n","app/broker","app/pubsub","app/viewport","app/core/View","app/planning/util/contextMenu","app/printers/templates/pageAction"],function(e,n,t,r,i,a,l,o,s){"use strict";var d=null;function c(t,r){null===d?function(t,r){var a=n.ajax({url:"/printing/printers"});i.subscribe("printing.printers.**",function(n,t){if(null!==d)switch(t){case"printing.printers.added":d.push(n.model),p();break;case"printing.printers.deleted":d=d.filter(function(e){return e._id!==n.model._id});break;case"printing.printers.edited":var r=e.find(d,function(e){return e._id===n.model._id});r?e.assign(r,n.model):d.push(n.model),p()}}),a.fail(function(){r([])}),a.done(function(e){d=e.collection||[],p(),r(u(t))})}(t,r):setTimeout(r,1,u(t))}function u(n){return n&&d?d.filter(function(t){return e.isEmpty(t.tags)||e.includes(t.tags,n)}):d||[]}function p(){d.sort(function(e,n){return e.label.localeCompare(n.label,void 0,{numeric:!0,ignorePunctuation:!0})})}return l.extend({},{contextMenu:function(e,n){e.contextMenu.hide=!1;var i=r.sandbox();i.subscribe("planning.contextMenu.hidden",function(){i.destroy(),i=null,e.contextMenu.onCancel&&e.contextMenu.onCancel()}),c(e.contextMenu.tag,function(r){if(i){if(!r.length)return n(null);var a=[t("printers","menu:header"),{label:t("printers","menu:browser"),handler:n.bind(null,null)}].concat(r.map(function(e){return{label:e.label,handler:n.bind(null,e._id)}}));o.show(e.contextMenu.view,e.pageY-40,e.pageX-15,a)}})},listAction:function(e,t){var r=n(e.currentTarget).addClass("disabled").prop("disabled",!0);e.contextMenu=e.listAction,e.contextMenu.onCancel=function(){r.removeClass("disabled").prop("disabled",!1)},this.contextMenu(e,function(n){e.contextMenu.onCancel(),t(n)})},pageAction:function(e,r){var i=e.view.model||e.view.collection,l=i.getNlsDomain?i.getNlsDomain():i.nlsDomain||"core",o="PAGE_ACTION:print",p=e.label||(t.has(l,o)?t(l,o):t("core",o)),f=u(e.tag);return 0===f.length?{label:p,icon:"print",privileges:"USER",callback:function(t){if(d&&0===u(e.tag).length)return r(null);var i=n(t.currentTarget).find(".btn").addClass("disabled").prop("disabled",!0),l=i.find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),o=e.view.broker.sandbox();o.subscribe("html2pdf.completed",function(){o.destroy(),o=null,l.removeClass("fa-spinner fa-spin").addClass("fa-print"),i.prop("disabled",!1).removeClass("disabled")}),c(e.tag,function(n){if(o){if(!n.length)return r(null);a.currentLayout.setActions(e.view.actions,e.view),a.currentLayout.$(".page-actions-printers").find(".btn").click()}})}}:{template:function(){return s({label:p,printers:f})},callback:function(e){var t=n(e.currentTarget);t.data("printers-bound")||(t.data("printers-bound",!0),t.find(".dropdown-menu").on("click","a",function(e){r(e.currentTarget.dataset.printerId||null)}))}}},selectField:function(r,i){i=e.assign({id:"printer",label:t("printers","select:label")},i);var a=r.$id(i.id||"printer");if(!a.length){var l=r.$(".form-actions");if(!l.length)return;a=n("<div></div>").insertBefore(l)}a.prop("id","").addClass("form-group"),a.append('<label for="'+r.idPrefix+"-"+i.id+'">'+i.label+"</label>"),a.append('<input class="form-control" value="" readonly id="'+r.idPrefix+"-"+i.id+'" placeholder="'+t("printers","select:browser")+'">');var o=u(i.tag);function s(e){a.addClass("has-required-select2"),r.$id(i.id).removeClass("form-control").prop("placeholder",t("printers","select:placeholder")).prop("readonly",!1).prop("required",!0).select2({width:"100%",data:[{id:"browser",text:t("printers","select:browser")}].concat(e.map(function(e){return{id:e._id,text:e.label}}))})}d&&0===o.length?a.remove():null===d?c(i.tag,function(e){0!==r.$id(i.id).length&&(0!==e.length?s(e):a.remove())}):s(o)}})});