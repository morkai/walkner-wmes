define(["underscore","app/time","app/core/views/FilterView","app/core/util/idAndLabel","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","../dictionaries","app/pfepEntries/templates/filter"],function(e,t,i,r,a,n,s,c){"use strict";return i.extend({filterList:["nc12","packType","vendor","creator","limit"],filterMap:{},template:c,events:e.assign({"click a[data-date-time-range]":a.handleRangeEvent,"mouseup #-result > .btn":function(e){var t=e.currentTarget,i=t.firstElementChild;i.checked&&setTimeout(function(){t.classList.remove("active"),i.checked=!1},1)}},i.prototype.events),localTopics:{"pfep.dictionaries.updated":function(e){"packTypes"===e.dictionary?this.setUpPackTypeSelect2():"vendors"===e.dictionary&&this.setUpVendorSelect2()}},defaultFormData:function(){return{nc12:"",packType:"",vendor:"",creator:""}},termToForm:{createdAt:a.rqlToForm,nc12:function(e,t,i){i.nc12=t.args[1].replace(/[^A-Z0-9]+/g,"")},packType:function(e,t,i){i[e]=t.args[1]},"creator.id":function(e,t,i){i[e.split(".")[0]]="in"===t.name?t.args[1].join(","):t.args[1]}},serializeFormToQuery:function(e){var t=this.$id("nc12").val().replace(/[^0-9A-Za-z]+/g,"").toUpperCase(),i=this.$id("creator").val();a.formToRql(this,e),/^([0-9]{12}|[A-Z][A-Z0-9]{6})$/.test(t)?e.push({name:"eq",args:["nc12",t]}):t.length&&e.push({name:"regex",args:["nc12","^"+t]}),i.length&&(-1===i.indexOf(",")?e.push({name:"eq",args:["creator.id",i]}):e.push({name:"in",args:["creator.id",i.split(",")]})),["packType","vendor"].forEach(function(t){var i=this.$id(t).val().trim();i&&e.push({name:"eq",args:[t,i]})},this)},getTemplateData:function(){return{packTypes:s.packTypes,units:s.units,vendors:s.vendors}},afterRender:function(){i.prototype.afterRender.call(this),this.$id("limit").parent().attr("data-filter","limit"),this.$id("filters").select2({width:"175px"}),n(this.$id("creator"),{view:this,width:"275px"}),this.setUpPackTypeSelect2(),this.setUpVendorSelect2()},setUpPackTypeSelect2:function(){this.$id("packType").select2({width:"175px",allowClear:!0,placeholder:" ",data:s.packTypes.map(function(e){return{id:e,text:e}})})},setUpVendorSelect2:function(){this.$id("vendor").select2({width:"275px",allowClear:!0,placeholder:" ",data:s.vendors.map(function(e){return{id:e,text:e}})})},showFilter:function(e){"date"!==e?i.prototype.showFilter.apply(this,arguments):this.$id("from-date").focus()}})});