// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","../View","./ActionFormView","./PaginationView","app/core/templates/printableList"],function(t,e,i,n,r,o){return i.extend({template:o,serialize:function(){return{className:this.className||"",columns:this.serializeColumns(),rows:this.serializeRows()}},serializeColumns:function(){var e,i=this.collection.getNlsDomain();return e=Array.isArray(this.options.columns)?this.options.columns:Array.isArray(this.columns)?this.columns:[],e.map(function(e){return{id:e,label:t(i,"PROPERTY:"+e)}})},serializeRows:function(){return this.collection.toJSON()},afterRender:function(){this.listenToOnce(this.collection,"reset",this.render)},fitToPrintablePage:function(t){var e=this.$("table"),i=e.find("thead").outerHeight(),n=[[]],r=i,o=this;this.$("tbody > tr").each(function(){var e=o.$(this),s=e.height();r+s>t&&(r=i,n[n.length-1].forEach(function(t){t.detach()}),n.push([])),r+=s,n[n.length-1].push(e)}),e.find("tbody").empty();var s=n.map(function(t){var i=e.clone(),n=i.find("tbody");return t.forEach(function(t){n.append(t.detach())}),i});return e.remove(),s}})});