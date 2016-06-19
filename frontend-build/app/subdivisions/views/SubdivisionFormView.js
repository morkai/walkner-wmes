// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/data/aors","app/data/downtimeReasons","app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/core/util/idAndLabel","app/subdivisions/templates/form","app/subdivisions/templates/autoDowntimeRow"],function(t,e,o,i,a,n,s,r,d){"use strict";return n.extend({template:r,events:t.extend(n.prototype.events,{"click #-addAutoDowntime":function(){var t=this.$id("autoDowntimeReason"),e=t.val();e&&this.addAutoDowntime({reason:e,when:"always"}),t.select2("val",null).select2("focus")},'click .btn[data-auto-downtime-action="up"]':function(t){var e=this.$(t.target).closest("tr"),o=e.prev();o.length&&e.insertBefore(o)},'click .btn[data-auto-downtime-action="down"]':function(t){var e=this.$(t.target).closest("tr"),o=e.next();o.length&&e.insertAfter(o)},'click .btn[data-auto-downtime-action="remove"]':function(t){var e=this.$(t.target).closest("tr").fadeOut("fast",function(){e.remove()})}}),initialize:function(){n.prototype.initialize.call(this),this.autoDowntimeCounter=0,this.orgUnitDropdownsView=new a({orgUnit:a.ORG_UNIT.DIVISION,required:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){n.prototype.afterRender.call(this);var t=this.orgUnitDropdownsView;this.listenToOnce(t,"afterRender",function(){t.selectValue(this.model).focus(),t.$id("division").select2("enable",!this.options.editMode)}),this.$id("prodTaskTags").select2({tags:this.model.allTags||[],tokenSeparators:[","]}),this.$id("aor").select2({placeholder:" ",allowClear:!0,data:o.map(s)}),this.$id("autoDowntimeReason").select2({width:"400px",allowClear:!1,data:i.map(s)}),this.model.get("autoDowntimes").forEach(this.addAutoDowntime,this)},serializeToForm:function(){var t=this.model.toJSON();return t.prodTaskTags=t.prodTaskTags?t.prodTaskTags.join(","):"",t},serializeForm:function(t){return t.prodTaskTags="string"==typeof t.prodTaskTags?t.prodTaskTags.split(","):[],t.aor=o.get(t.aor)?t.aor:null,t.autoDowntime=i.get(t.autoDowntime)?t.autoDowntime:null,t.initialDowntime=i.get(t.initialDowntime)?t.initialDowntime:null,t},addAutoDowntime:function(t){var e=this.$id("autoDowntimes"),o=e.find('input[value="'+t.reason+'"]');o.length||this.$id("autoDowntimes").append(d({autoDowntime:{i:++this.autoDowntimeCounter,reason:s(i.get(t.reason)),when:t.when}}))}})});