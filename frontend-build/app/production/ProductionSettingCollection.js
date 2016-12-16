// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../data/localStorage","../settings/SettingCollection","./ProductionSetting"],function(t,e,i,n,a){"use strict";return n.extend({model:a,topicSuffix:"production.**",initialize:function(t,e){n.prototype.initialize.apply(this,arguments),this.resetCache(),e.localStorage&&this.setUpLocalStorage(),this.on("reset change",this.resetCache)},resetCache:function(){this.cache={taktTimeEnabled:{}}},getValue:function(t){var e=this.get("production."+t);return e?e.getValue():null},prepareValue:function(e,i){return/rearmDowntimeReason$/.test(e)?t.isEmpty(i)?null:i:/spigot(Not)?Patterns$/.test(e)?this.prepareSpigotPatterns(i):/lines$/i.test(e)?this.prepareLines(i):/spigotGroups$/.test(e)?this.prepareSpigotGroups(i):/(spigotFinish|enabled|last|avg|sap|smiley)$/.test(e)?!!i:/taktTime.coeffs$/.test(e)?this.prepareTaktTimeCoeffs(i):/ignoredDowntimes$/i.test(e)?this.prepareMultiSelect2Value(i):this.prepareNumericValue(i,0,60)},prepareSpigotPatterns:function(t){return"string"!=typeof t?void 0:t.split("\n").filter(function(t){try{new RegExp(t)}catch(e){return!1}return!!t.trim().length}).join("\n")},prepareLines:function(t){return"string"!=typeof t?void 0:t.split(",").filter(function(t){return!!t.length}).join(",")},prepareSpigotGroups:function(t){return(t||"").split("\n").map(function(t){var e=t.split(/[^0-9]+/).filter(function(t){return t.length>0});return 0===e.length?"":e.shift()+": "+e.join(", ")}).join("\n").replace(/\n{2,}/g,"\n")},isTaktTimeEnabled:function(t){var e=this.cache.taktTimeEnabled[t];if(void 0!==e)return e;if(this.getValue("taktTime.enabled"))if(t){var i=this.getValue("taktTime.lines")||[];e=0===i.length||-1!==i.indexOf(t)}else e=!0;else e=!1;return this.cache.taktTimeEnabled[t]=e,e},showLastTaktTime:function(){return!!this.getValue("taktTime.last")},showAvgTaktTime:function(){return!!this.getValue("taktTime.avg")},showSapTaktTime:function(){return!!this.getValue("taktTime.sap")},showSmiley:function(){return!!this.getValue("taktTime.smiley")},getTaktTimeCoeff:function(t,e){var i=this.cache.taktTimeCoeffs;i||(i=this.cache.taktTimeCoeffs=this.mapTaktTimeCoeffs(this.getValue("taktTime.coeffs")));var n=i[t]||i["*"]||{};return n?n[e]||n["*"]||1:1},mapTaktTimeCoeffs:function(t){var e={};return t.split("\n").forEach(function(t){for(var i,n={},a=t,r=/([A-Z0-9]+[A-Z0-9_\- ]*|\*)\s*=\s*([0-9]+(?:(?:\.|,)[0-9]+)?)/gi,s=0;null!==(i=r.exec(t));)n[i[1].toUpperCase()]=parseFloat(i[2].replace(",",".")),a=a.replace(i[0],""),s+=1;var o=-1===a.indexOf("*")?a.split(/[^A-Za-z0-9]/)[0].toUpperCase():"*";s&&o.length&&(e[o]=n)}),e},prepareTaktTimeCoeffs:function(t){var e=this.mapTaktTimeCoeffs(t);return Object.keys(e).map(function(t){var i=t+":";return Object.keys(e[t]).forEach(function(n){i+=" "+n+"="+e[t][n]}),i}).join("\n")},setUpLocalStorage:function(){this.length||this.readLocalData(),this.on("reset change",this.saveLocalData.bind(this))},readLocalData:function(){try{this.reset(JSON.parse(i.getItem("PRODUCTION:SETTINGS")))}catch(t){}},saveLocalData:function(){i.setItem("PRODUCTION:SETTINGS",JSON.stringify(this.models))}})});