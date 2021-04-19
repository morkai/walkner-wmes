define(["underscore","app/i18n","app/core/views/ListView","app/wmes-oshAudits/templates/detailsRow"],function(e,s,i,a){"use strict";return i.extend({className:"is-colored is-clickable",events:Object.assign({"click .oshAudits-list-expander":function(e){var s=e.currentTarget;return s.classList.contains("is-enabled")&&this.toggleDetails(s.parentNode.dataset.id,s.dataset.id),!1}},i.prototype.events),serializeColumns:function(){return[{id:"rid",className:"is-min is-number"},{id:"status",className:"is-min"},{id:"date",className:"is-min"},{id:"auditor",className:"is-min"},{id:"section",className:"is-min"},{id:"categories",className:"is-overflow w400",tdClassName:"oshAudits-list-expander is-enabled"},{id:"nok",tdClassName:"oshAudits-list-expander is-enabled"}]},toggleDetails:function(e,s){var i=this.$(`.list-item[data-id="${e}"]`),a=this.$(".is-expanded");this.collapseDetails(a),i[0]===a[0]&&a.attr("data-expanded-column-id")===s||this.expandDetails(i,s)},collapseDetails:function(e){e.removeClass("is-expanded").next().remove()},expandDetails:function(e,s){var i=this.collection.get(e.attr("data-id")),t={columnId:s,model:{nearMiss:i.get("nearMiss")}};t.model.results=i.serializeDetails().results,this.renderPartial(a,t).insertAfter(e),e.addClass("is-expanded").attr("data-expanded-column-id",s)}})});