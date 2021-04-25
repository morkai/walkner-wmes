define(["underscore","app/core/views/DetailsView","app/kaizenOrders/dictionaries","app/suggestions/templates/details"],function(e,t,i,s){"use strict";return t.extend({template:s,getTemplateData:function(){var e=this.model.get("status"),t="new"!==e&&"accepted"!==e;return{showKaizenPanel:t,suggestionColumnSize:t?6:12,kaizenColumnSize:t?6:0}},afterRender:function(){var e=this;t.prototype.afterRender.call(e),e.$(".prop[data-dictionary]").each(function(){var t=i[this.dataset.dictionary].get(e.model.get(this.dataset.property));if(t){var s=t.get("description");s&&(this.classList.toggle("has-description",!0),this.dataset.description=s)}}),e.$el.popover({container:this.el,selector:".has-description",className:"suggestions-details-popover",trigger:"hover",placement:function(t,i){if(window.innerWidth<=992)return"top";var s=e.$(i).closest(".panel").parent();return s[0]===s.parent().children().last()[0]?"top":"right"},content:function(){return this.dataset.description}})},editModel:function(t){var i=t;e.last(t.changes).data.resolutions&&(i=e.omit(i,"resolutions"),this.reloadResolutions()),this.model.set(i)},reloadResolutions:function(){var e=this;e.ajax({url:e.model.url()+"?select(resolutions)"}).done(function(t){e.model.set(t)})}})});