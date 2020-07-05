define(["underscore","jquery","app/core/views/FormView","app/core/util/idAndLabel","app/data/orgUnits","app/orgUnits/util/setUpOrgUnitSelect2","app/wmes-ct-lines/templates/form","app/wmes-ct-lines/templates/inveo/commonForm","app/wmes-ct-lines/templates/inveo/stationForm","app/wmes-ct-lines/templates/luma2/commonForm","app/wmes-ct-lines/templates/luma2/stationForm","app/wmes-ct-lines/templates/balluff/commonForm","app/wmes-ct-lines/templates/balluff/stationForm"],function(t,e,n,i,o,a,r,s,c,l,p,m,d){"use strict";var u={inveo:{common:s,station:c},luma2:{common:l,station:p},balluff:{common:m,station:d}};return n.extend({template:r,events:t.assign({"click #-addStation":function(){this.addStation().find("input").first().focus(),this.recalcStationNo()},'click .btn[role="moveUp"]':function(t){var e=this.$(t.currentTarget).closest(".panel"),n=e.prev();n.length&&(e.insertBefore(n),this.recalcStationNo(),t.currentTarget.focus())},'click .btn[role="moveDown"]':function(t){var e=this.$(t.currentTarget).closest(".panel"),n=e.next();n.length&&(e.insertAfter(n),this.recalcStationNo(),t.currentTarget.focus())},'click .btn[role="remove"]':function(t){var n=this;n.$(t.currentTarget).closest(".panel").fadeOut("fast",function(){e(this).remove(),n.recalcStationNo()})},'change input[name="type"]':function(){this.$id("stations").empty(),this.renderCommon()}},n.prototype.events),initialize:function(){n.prototype.initialize.apply(this,arguments),this.nextStationIndex=0},afterRender:function(){var e=this;e.renderCommon(),t.forEach(e.model.get("stations"),function(t){e.addStation(e.model.get("type"),t)}),n.prototype.afterRender.call(e);var i=e.$id("id");e.options.editMode?(i.prop("readonly",!0),e.$('input[name="type"]').prop("disabled",!0),e.$id("active").focus()):(a(i,{orgUnitType:"prodLine",itemFilter:function(t){var e=o.getByTypeAndId("subdivision",o.getAllForProdLine(t.model).subdivision);return e&&"assembly"===e.get("type")}}),i.select2("focus")),e.recalcStationNo()},getSelectedType:function(){return this.$('[name="type"]:checked').val()||this.model.get("type")||"inveo"},renderCommon:function(){var t=u[this.getSelectedType()].common,e=this.renderPartialHtml(t);this.$id("common").html(e)},addStation:function(t){t||(t=this.getSelectedType());var e=u[t];if(!e)throw new Error("Invalid type: "+t);var n=this.renderPartial(e.station,{idPrefix:this.idPrefix+"-"+this.nextStationIndex,stationIndex:this.nextStationIndex});return this.$id("stations").append(n),++this.nextStationIndex,n},recalcStationNo:function(){var t=this;this.$id("stations").find(".panel-heading-title").each(function(e){this.innerText=t.t("stations:title",{no:e+1})})},serializeForm:function(t){return Array.isArray(t.stations)||(t.stations=this.$id("stations").children().map(function(){return{}}).get()),t}})});