// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/broker","app/pubsub","app/core/View","app/planning/util/contextMenu","app/printers/templates/form"],function(n,e,t,i,r,u,l,a){"use strict";function o(n){null===d?p(n):setTimeout(n,1,d)}function p(t){var i=e.ajax({url:"/printing/printers"});r.subscribe("printing.printers.**",function(e,t){if(null!==d)switch(t){case"printing.printers.added":d.push(e.model),c();break;case"printing.printers.deleted":d=d.filter(function(n){return n._id!==e.model._id});break;case"printing.printers.edited":var i=n.find(d,function(n){return n._id===e.model._id});i?n.assign(i,e.model):d.push(e.model),c()}}),i.fail(function(){t([])}),i.done(function(n){d=n.collection||[],t(d)})}function c(){d.sort(function(n,e){return n.label.localeCompare(e.label)})}var d=null;return u.extend({template:a,afterRender:function(){}},{contextMenu:function(n,e){n.contextMenu.hide=!1;var r=i.sandbox(),u=!1;r.subscribe("planning.contextMenu.hidden",function(){u=!0}),o(function(i){if(r.destroy(),!u){if(!i.length)return e(null);var a=[t("printers","menu:header"),{label:t("printers","menu:browser"),handler:e.bind(null,null)}].concat(i.map(function(n){return{label:n.label,handler:e.bind(null,n._id)}}));l.show(n.contextMenu.view,n.pageY-40,n.pageX-15,a)}})}})});