define(["underscore","../time","../user","../core/Model","../data/orgUnits","../data/localStorage"],function(e,i,t,r,n,a){"use strict";var s={days:!0,shifts:!0,divisions:!0,subdivisionTypes:!0,prodLines:!0},l={fap0:6,startup:3,shutdown:4,meetings:5,sixS:6,tpm:7,trainings:8,breaks:30,coTime:9,downtime:3,unplanned:0},o=["totalVolumeProduced:plan","totalVolumeProduced:real","averageRoutingTime:real","prodBasedPlanners:plan","prodBasedPlanners:real","prodQualityInspection:plan","prodQualityInspection:real","prodOperators:plan","prodOperators:real","prodSetters:plan","prodSetters:real","masters:plan","masters:real","leaders:plan","leaders:real","prodMaterialHandling:plan","prodMaterialHandling:real","kitters:plan","kitters:real","prodTransport:plan","prodTransport:real","cycleCounting:plan","cycleCounting:real","otherWarehousing:plan","otherWarehousing:real","materialQualityInspection:plan","materialQualityInspection:real","maintenance:plan","maintenance:real","timeAvailablePerShift:plan","timeAvailablePerShift:real","routingTimeForLine:plan","routingTimeForLine:real","routingTimeForLabour:plan","routingTimeForLabour:real","heijunkaTimeForLine:plan","breaks:plan","breaks:real","fap0:plan","fap0:real","startup:plan","startup:real","shutdown:plan","shutdown:real","meetings:plan","meetings:real","sixS:plan","sixS:real","tpm:plan","tpm:real","trainings:plan","trainings:real","coTime:plan","coTime:real","downtime:plan","downtime:real","plan:plan","plan:real","efficiency:plan","efficiency:real"];return r.extend({defaults:function(){var t=i.getMoment().startOf("day"),r=t.valueOf(),a={from:t.subtract(7,"days").valueOf(),to:r,interval:"day",unit:"m",days:["1","2","3","4","5","6","7","noWork"],shifts:["1","2","3"],divisions:n.getAllByType("division").filter(function(e){return"prod"===e.get("type")}).map(function(e){return e.id}),subdivisionTypes:["assembly","press"],prodLines:[],visibleSeries:{}};return e.assign(a,l)},initialize:function(){this.on("change",function(){a.setItem("LEAN_FILTER",JSON.stringify(e.omit(this.attributes,"visibleSeries"))),a.setItem("LEAN_VISIBLE_SERIES",JSON.stringify(this.attributes.visibleSeries))})},serializeToObject:function(){var i=this.toJSON();return e.forEach(i,function(t,r){"visibleSeries"===r||"_rnd"===r?i[r]=void 0:e.isArray(t)&&(i[r]=t.join(","))}),i},serializeToString:function(){var i="";return e.forEach(this.attributes,function(e,t){"visibleSeries"!==t&&"_rnd"!==t&&(i+="&"+t+"="+e)}),i.substr(1)},serializeSeriesVisibility:function(){var i="",t=this.attributes.visibleSeries;return e.forEach(o,function(e){i+=t[e]?"1":"0"}),e.forEach(t,function(e,t){e&&/^[a-f0-9]{24}/.test(t)&&(i+=","+t.substring(0,24))}),i},toggleSeriesVisibility:function(e){var i=this.attributes.visibleSeries;i[e]=!i[e],this.trigger("change:visibleSeries"),this.trigger("change")},isVisibleSeries:function(e){return!0===this.attributes.visibleSeries[e]},hasAllDivisionsSelected:function(){var e=this.get("divisions"),i=n.getAllByType("division").filter(function(e){return"prod"===e.get("type")});return 0===e.length||e.length===i.length}},{NUMERIC_PROPS:l,SERIES:o,fromRequest:function(i,t){var r={visibleSeries:{}};if(e.isEmpty(i)&&e.assign(r,JSON.parse(a.getItem("LEAN_FILTER")||"{}")),e.forEach(i,function(e,i){s[i]?e=""===e?[]:e.split(","):/^[0-9]+$/.test(e)&&(e=parseInt(e,10)),r[i]=e}),t.length){var n=t.split(","),l=n.shift();e.forEach(o,function(e,i){r.visibleSeries[e]="1"===l.charAt(i)}),e.forEach(n,function(e){r.visibleSeries[e+":real"]=!0})}else r.visibleSeries=JSON.parse(a.getItem("LEAN_VISIBLE_SERIES")||"{}");return new this(r)}})});