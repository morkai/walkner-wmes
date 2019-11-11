define(["js2form","app/time","app/core/View","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/util/forms/dateTimeRange","app/mrpControllers/util/setUpMrpSelect2","app/data/orgUnits","../dictionaries","../Entry","app/wmes-fap-entries/templates/countReportFilter","app/core/util/ExpandableSelect"],function(e,t,i,r,a,s,n,o,l,c,p){"use strict";return i.extend({template:p,events:{"click a[data-date-time-range]":s.handleRangeEvent,submit:function(){return this.changeFilter(),!1},"click #-levels .active":function(e){setTimeout(function(){e.currentTarget.classList.remove("active"),e.currentTarget.querySelector("input").checked=!1},1)}},destroy:function(){this.$(".is-expandable").expandableSelect("destroy")},afterRender:function(){e(this.el,this.serializeFormData()),r.toggle(this.$id("interval")),r.toggle(this.$id("levels")),this.$(".is-expandable").expandableSelect(),n(this.$id("mrps"),{own:!0,view:this,width:"250px"}),this.setUpCategorySelect2()},getTemplateData:function(){return{divisions:o.getAllByType("division").filter(function(e){return e.isActive()&&"prod"===e.get("type")}).map(a),subdivisionTypes:l.subdivisionTypes}},serializeFormData:function(){var e=this.model,i=+e.get("from"),r=+e.get("to");return{interval:e.get("interval"),"from-date":i?t.format(i,"YYYY-MM-DD"):"","to-date":r?t.format(r,"YYYY-MM-DD"):"",categories:e.get("categories").concat(e.get("subCategories")).join(","),mrps:e.get("mrps").join(","),subdivisionTypes:e.get("subdivisionTypes").join(","),divisions:e.get("divisions").join(","),levels:e.get("levels")}},changeFilter:function(){var e=this,t=s.serialize(e),i=r.getValue(this.$id("levels")),a={from:t.from?t.from.valueOf():0,to:t.to?t.to.valueOf():0,interval:r.getValue(this.$id("interval")),levels:null==i?-1:parseInt(i,10)||0};["categories","mrps","subdivisionTypes","divisions"].forEach(function(t){var i=e.$id(t).val();a[t]=Array.isArray(i)?i:i?i.split(","):[]}),a.categories.length&&(a.subCategories=[],a.categories=a.categories.filter(function(e){return!l.subCategories.get(e)||(a.subCategories.push(e),!1)})),e.model.set(a),e.model.trigger("filtered")},setUpCategorySelect2:function(){var e={};l.subCategories.forEach(function(t){if(t.get("active")){var i=t.get("parent");e[i]||(e[i]=[]),e[i].push(t)}}),this.$id("categories").select2({width:"350px",multiple:!0,allowClear:!0,data:l.categories.filter(function(e){return e.get("active")}).map(function(t){var i=e[t.id];return{id:t.id,text:t.getLabel(),children:i?i.map(a):[]}})})}})});