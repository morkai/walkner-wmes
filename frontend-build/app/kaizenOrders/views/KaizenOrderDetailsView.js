// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/DetailsView","../dictionaries","app/kaizenOrders/templates/details"],function(e,t,i,n){"use strict";var s={100:[12,0,0],"010":[0,12,0],"001":[0,0,12],110:[6,6,0],"011":[0,8,4],101:[6,0,6],111:[4,4,4]};return t.extend({template:n,serialize:function(){var i=this.model.get("types"),n=e.contains(i,"nearMiss"),a=e.contains(i,"suggestion"),r=e.contains(i,"kaizen"),o=s[(n?"1":"0")+(a?"1":"0")+(r?"1":"0")];return e.extend(t.prototype.serialize.call(this),{showNearMissPanel:n,showSuggestionPanel:a,showKaizenPanel:r,nearMissColumnSize:o[0],suggestionColumnSize:o[1],kaizenColumnSize:o[2]})},afterRender:function(){t.prototype.afterRender.call(this);var n=this.model;this.$(".prop[data-dictionary]").each(function(){var t=i[this.dataset.dictionary].get(n.get(this.dataset.property));if(t){var s=t.get("description");e.isEmpty(s)||(this.classList.toggle("has-description",!0),this.dataset.description=s)}}),this.$el.popover({container:this.el,selector:".has-description",placement:function(){return window.innerWidth<=992?"top":"right"},trigger:"hover",content:function(){return this.dataset.description}})}})});