define(["underscore","app/i18n","app/core/views/ListView","app/wmes-oshAudits/templates/detailsRow"],function(e,s,t,i){"use strict";return t.extend({className:"is-colored is-clickable",events:Object.assign({"click .oshAudits-list-expander":function(e){var s=e.currentTarget;return s.classList.contains("is-enabled")&&this.toggleDetails(s.parentNode.dataset.id,s.dataset.id),!1}},t.prototype.events),serializeColumns:function(){return[{id:"rid",className:"is-min is-number"},{id:"status",className:"is-min"},{id:"date",className:"is-min"},{id:"auditor",className:"is-min"},{id:"section",className:"is-min"},{id:"nok",tdAttrs:function(e){return{className:"oshAudits-list-expander "+(e.anyNok?"is-enabled":"")}}}]},toggleDetails:function(e,s){var t=this.$('.list-item[data-id="'+e+'"]'),i=this.$(".is-expanded");this.collapseDetails(i),t[0]===i[0]&&i.attr("data-expanded-column-id")===s||this.expandDetails(t,s)},collapseDetails:function(e){e.removeClass("is-expanded").next().remove()},expandDetails:function(e,s){var t=this.collection.get(e.attr("data-id")),a={columnId:s,model:{}};a.model.results=t.get("results"),this.renderPartial(i,a).insertAfter(e),e.addClass("is-expanded").attr("data-expanded-column-id",s)}})});