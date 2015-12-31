// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../user","../core/Model","../data/orgUnits"],function(e,i,r,t,a){"use strict";var n={days:!0,shifts:!0,divisions:!0,subdivisionTypes:!0,prodLines:!0},s={fap0:6,startup:3,shutdown:4,meetings:5,sixS:6,tpm:7,trainings:8,breaks:30,coTime:9,downtime:3,unplanned:0},l=["totalVolumeProduced:plan","totalVolumeProduced:real","averageRoutingTime:real","prodBasedPlanners:plan","prodBasedPlanners:real","prodQualityInspection:plan","prodQualityInspection:real","prodOperators:plan","prodOperators:real","prodSetters:plan","prodSetters:real","masters:plan","masters:real","leaders:plan","leaders:real","prodMaterialHandling:plan","prodMaterialHandling:real","kitters:plan","kitters:real","prodTransport:plan","prodTransport:real","cycleCounting:plan","cycleCounting:real","otherWarehousing:plan","otherWarehousing:real","materialQualityInspection:plan","materialQualityInspection:real","maintenance:plan","maintenance:real","timeAvailablePerShift:plan","timeAvailablePerShift:real","routingTimeForLine:plan","routingTimeForLine:real","routingTimeForLabour:plan","routingTimeForLabour:real","heijunkaTimeForLine:plan","breaks:plan","breaks:real","fap0:plan","fap0:real","startup:plan","startup:real","shutdown:plan","shutdown:real","meetings:plan","meetings:real","sixS:plan","sixS:real","tpm:plan","tpm:real","trainings:plan","trainings:real","coTime:plan","coTime:real","downtime:plan","downtime:real","plan:plan","plan:real","efficiency:plan","efficiency:real"];return t.extend({defaults:function(){var r=i.getMoment().startOf("day"),t=r.valueOf(),n={from:r.subtract(7,"days").valueOf(),to:t,interval:"day",unit:"m",days:["1","2","3","4","5","6","7","noWork"],shifts:["1","2","3"],divisions:a.getAllByType("division").filter(function(e){return"prod"===e.get("type")}).map(function(e){return e.id}),subdivisionTypes:["assembly","press"],prodLines:[],visibleSeries:{}};return e.extend(n,s)},initialize:function(){this.on("change",function(){localStorage.LEAN_FILTER=JSON.stringify(e.omit(this.attributes,"visibleSeries")),localStorage.LEAN_VISIBLE_SERIES=JSON.stringify(this.attributes.visibleSeries)})},serializeToObject:function(){var i=this.toJSON();return e.forEach(i,function(r,t){"visibleSeries"===t?i[t]=void 0:e.isArray(r)&&(i[t]=r.join(","))}),i},serializeToString:function(){var i="";return e.forEach(this.attributes,function(e,r){"visibleSeries"!==r&&(i+="&"+r+"="+e)}),i.substr(1)},serializeSeriesVisibility:function(){var i="",r=this.attributes.visibleSeries;return e.forEach(l,function(e){i+=r[e]?"1":"0"}),e.forEach(r,function(e,r){e&&/^[a-f0-9]{24}/.test(r)&&(i+=","+r.substring(0,24))}),i},toggleSeriesVisibility:function(e){var i=this.attributes.visibleSeries;i[e]=!i[e],this.trigger("change:visibleSeries"),this.trigger("change")},isVisibleSeries:function(e){return this.attributes.visibleSeries[e]===!0}},{NUMERIC_PROPS:s,SERIES:l,fromRequest:function(i,r){var t={visibleSeries:{}};if(e.isEmpty(i)&&e.extend(t,JSON.parse(localStorage.LEAN_FILTER||"{}")),e.forEach(i,function(e,i){n[i]?e=e.split(","):/^[0-9]+$/.test(e)&&(e=parseInt(e,10)),t[i]=e}),r.length){var a=r.split(","),s=a.shift();e.forEach(l,function(e,i){t.visibleSeries[e]="1"===s.charAt(i)}),e.forEach(a,function(e){t.visibleSeries[e+":real"]=!0})}else t.visibleSeries=JSON.parse(localStorage.LEAN_VISIBLE_SERIES||"{}");return new this(t)}})});