// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/data/aors","app/data/downtimeReasons","app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/core/util/idAndLabel","app/subdivisions/templates/form","app/subdivisions/templates/autoDowntimeRow"],function(t,e,i,a,o,n,s,r,d,l){"use strict";return s.extend({template:d,events:t.extend(s.prototype.events,{"click #-addAutoDowntime":function(){var t=this.$id("autoDowntimeReason"),e=t.val();e&&this.addAutoDowntime({reason:e,when:"always",time:[]}),t.select2("val",null).select2("focus")},'click .btn[data-auto-downtime-action="up"]':function(t){var e=this.$(t.target).closest("tr"),i=e.prev();i.length&&e.insertBefore(i)},'click .btn[data-auto-downtime-action="down"]':function(t){var e=this.$(t.target).closest("tr"),i=e.next();i.length&&e.insertAfter(i)},'click .btn[data-auto-downtime-action="remove"]':function(t){var e=this.$(t.target).closest("tr").fadeOut("fast",function(){e.remove()})},'change [name$="when"]':function(t){var e=this.$(t.target).closest("tr"),i=e.find('[name$="when"]:checked').val();e.find('[name$="time"]').prop("disabled","time"!==i)},'change [name$="time"]':function(t){for(var e,i=/(?:([0-9]+)@)?([0-9]{1,2}):([0-9]{1,2})/g,a=[];null!==(e=i.exec(t.target.value));){var o=+e[1]||0;0>o?o=0:o>480&&(o=480);var n=+e[2];if(!(n>=24)){var s=+e[3];s>=60||(10>n&&(n="0"+n),10>s&&(s="0"+s),a.push((o?o+"@":"")+n+":"+s))}}t.target.value=a.join(", ")}}),initialize:function(){s.prototype.initialize.call(this),this.autoDowntimeCounter=0,this.orgUnitDropdownsView=new n({orgUnit:n.ORG_UNIT.DIVISION,required:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){s.prototype.afterRender.call(this);var t=this.orgUnitDropdownsView;this.listenToOnce(t,"afterRender",function(){t.selectValue(this.model).focus(),t.$id("division").select2("enable",!this.options.editMode)}),this.$id("prodTaskTags").select2({tags:this.model.allTags||[],tokenSeparators:[","]}),this.$id("aor").select2({placeholder:" ",allowClear:!0,data:a.map(r)}),this.$id("autoDowntimeReason").select2({width:"400px",allowClear:!1,data:o.map(function(t){return{id:t.id,text:t.id+" - "+t.getLabel()}})}),this.model.get("autoDowntimes").forEach(this.addAutoDowntime,this)},serializeToForm:function(){var t=this.model.toJSON();return t.prodTaskTags=t.prodTaskTags?t.prodTaskTags.join(","):"",t.deactivatedAt&&(t.deactivatedAt=i.format(t.deactivatedAt,"YYYY-MM-DD")),t},serializeForm:function(e){e.prodTaskTags="string"==typeof e.prodTaskTags?e.prodTaskTags.split(","):[],e.aor=a.get(e.aor)?e.aor:null,e.autoDowntimes||(e.autoDowntimes=[]),t.forEach(e.autoDowntimes,function(t){"time"===t.when&&(t.time=t.time.split(",").map(function(t){var e=t.match(/(?:([0-9]+)@)?([0-9]{1,2}):([0-9]{1,2})/);return{h:+e[2],m:+e[3],d:+e[1]||0}}))});var o=i.getMoment(e.deactivatedAt||null);return e.deactivatedAt=o.isValid()?o.toISOString():null,e},addAutoDowntime:function(t){var e=this.$id("autoDowntimes"),i=e.find('input[value="'+t.reason+'"]');i.length||this.$id("autoDowntimes").append(l({autoDowntime:{i:++this.autoDowntimeCounter,reason:r(o.get(t.reason)),when:t.when,time:(t.time||[]).map(function(t){return(t.d>0?t.d+"@":"")+(t.h<10?"0":"")+t.h+":"+(t.m<10?"0":"")+t.m}).join(", ")}}))}})});