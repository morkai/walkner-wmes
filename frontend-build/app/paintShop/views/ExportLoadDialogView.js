define(["app/time","app/core/View","app/core/util/forms/dateTimeRange","app/paintShop/templates/load/export"],function(t,e,i,a){"use strict";return e.extend({template:a,events:{"click a[data-date-time-range]":i.handleRangeEvent,'change input[type="date"]':function(){this.$id("submit").prop("disabled",!1)},submit:function(){this.$id("submit").prop("disabled",!0);var e=t.getMoment(this.$id("from-date").val(),"YYYY-MM-DD").valueOf(),i=t.getMoment(this.$id("to-date").val(),"YYYY-MM-DD").valueOf();return window.open("/paintShop/load;export.csv?_id=ge="+e+"&_id=lt="+i),!1}},afterRender:function(){var e=t.getMoment(this.model.get("from")),i=t.getMoment(this.model.get("to"));e.isValid()&&this.$id("from-date").val(e.format("YYYY-MM-DD")),i.isValid()&&this.$id("to-date").val(i.format("YYYY-MM-DD"))}})});