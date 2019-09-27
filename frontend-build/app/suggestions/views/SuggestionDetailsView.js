define(["underscore","jquery","app/core/views/DetailsView","app/kaizenOrders/dictionaries","app/suggestions/templates/details"],function(t,e,i,a,n){"use strict";return i.extend({template:n,currentTab:null,events:t.assign({'click a[data-toggle="tab"]':function(t){this.currentTab=t.currentTarget.dataset.tab}},i.prototype.events),serialize:function(){var e=this.model.get("status"),a="new"!==e&&"cancelled"!==e;return t.assign(i.prototype.serialize.call(this),{showKaizenPanel:a,suggestionColumnSize:a?6:12,kaizenColumnSize:a?6:0})},afterRender:function(){i.prototype.afterRender.call(this);var n=this;this.$(".prop[data-dictionary]").each(function(){var e=a[this.dataset.dictionary].get(n.model.get(this.dataset.property));if(e){var i=e.get("description");t.isEmpty(i)||(this.classList.toggle("has-description",!0),this.dataset.description=i)}}),this.$el.popover({container:this.el,selector:".has-description",placement:function(t,e){if(window.innerWidth<=992)return"top";var i=n.$(e).closest(".panel").parent();return i[0]===i.parent().children().last()[0]?"top":"right"},trigger:"hover",content:function(){return this.dataset.description},template:function(){return e(e.fn.popover.Constructor.DEFAULTS.template).addClass("suggestions-details-popover")}}),this.$('a[data-tab="'+(this.currentTab||this.options.initialTab)+'"]').click()}})});