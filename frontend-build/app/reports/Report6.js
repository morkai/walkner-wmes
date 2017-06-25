// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../core/Model"],function(t,e,o){"use strict";function n(t){return isNaN(t)||!isFinite(t)?0:Math.round(100*t)/100}return o.extend({urlRoot:"/reports/6",initialize:function(t,e){if(!e.query)throw new Error("query option is required!");this.query=e.query},getCategoryData:function(t){return this.attributes.category&&this.attributes.category[t]?this.attributes.category[t]:[]},getEffAndFteData:function(t){var e=this.attributes.effAndFte&&this.attributes.effAndFte[t]?this.attributes.effAndFte[t]:null;return{fte:e?e.fte:[],eff:e?e.eff:[]}},getTotalAndAbsenceData:function(t){var e=this.attributes.totalAndAbsence&&this.attributes.totalAndAbsence[t]?this.attributes.totalAndAbsence[t]:null;return{fte:e?e.fte:[],absence:e?e.absence:[]}},fetch:function(e){return t.isObject(e)||(e={}),e.data=t.extend(e.data||{},this.query.serializeToObject()),o.prototype.fetch.call(this,e)},parse:function(e){var o={settings:e.options.settings,prodTasks:e.options.prodTasks,effAndFte:{inComp:{fte:[],eff:[]},coopComp:{fte:[],eff:[]},exStorage:{fte:[],eff:[]},exTransactions:{fte:[],eff:[]},inTransactions:{fte:[],eff:[]}},category:{coopComp:[],exStorage:[],exTransactions:[],inTransactions:[],fifo:[],totalAbsence:[],compAbsence:[],finGoodsAbsence:[]},totalAndAbsence:{total:{fte:[],absence:[]},comp:{fte:[],absence:[]},finGoods:{fte:[],absence:[]}},fte:{fifo:{},totalAbsence:{},compAbsence:{},finGoodsAbsence:{}},count:{inComp:0,coopComp541:0,coopCompProcessing:0,exStorageOut:0,exStorageIn:0,fifo:0,staging:0,sm:0,paint:0,fixBin:0,finGoodsIn:0,finGoodsOut:0}},n=[],s=o.settings["fifo.prodTask"],a=[],f=o.settings["compAbsence.prodTask"],i=[],c=o.settings["finGoodsAbsence.prodTask"];t.forEach(o.prodTasks,function(t,e){t.parent===s&&n.push(e),t.parent===f&&a.push(e),t.parent===c&&i.push(e)});for(var r=this.query.get("interval"),u="day"!==r&&"shift"!==r,p=0,d=e.data.length;p<d;++p){var C=e.data[p],g=u&&C.dayCount?C.dayCount:1;void 0===C.compTasks&&this.prepareEmptyGroupData(C),this.calcNormalTaskFte(o,C,g),this.calcExTransactions(o,C,g),this.calcInTransactions(o,C,g),this.calcFifo(o,C,n,g),this.calcEffAndFte(o,C,"staging",g),this.calcEffAndFte(o,C,"sm",g,!0),this.calcEffAndFte(o,C,"paint",g),this.calcEffAndFte(o,C,"fixBin",g),this.calcEffAndFte(o,C,"finGoodsIn",g),this.calcEffAndFte(o,C,"finGoodsOut",g),this.calcAbsence(o,C,a,i,g)}return o.category.coopComp.push(this.createCategoryPoint("coopComp541",o.count.coopComp541),this.createCategoryPoint("coopCompProcessing",o.count.coopCompProcessing)),o.category.exStorage.push(this.createCategoryPoint("exStorageIn",o.count.exStorageIn),this.createCategoryPoint("exStorageOut",o.count.exStorageOut)),o.category.exTransactions.push(this.createCategoryPoint("inComp",o.count.inComp),this.createCategoryPoint("coopComp",o.count.coopComp541+o.count.coopCompProcessing),this.createCategoryPoint("exStorage",o.count.exStorageIn+o.count.exStorageOut)),o.category.inTransactions.push(this.createCategoryPoint("staging",o.count.staging),this.createCategoryPoint("fifo",o.count.fifo),this.createCategoryPoint("paint",o.count.paint),this.createCategoryPoint("fixBin",o.count.fixBin)),this.createFteCategoryPoints(o,"fifo"),this.createFteCategoryPoints(o,"totalAbsence"),this.createFteCategoryPoints(o,"compAbsence"),this.createFteCategoryPoints(o,"finGoodsAbsence"),o},createCategoryPoint:function(t,o){return{name:e("reports","wh:category:name:"+t),y:o}},createFteCategoryPoints:function(e,o){t.forEach(e.fte[o],function(t,n){var s=e.prodTasks[n];e.category[o].push({name:s.name,y:t,color:s.color})})},prepareEmptyGroupData:function(e){return t.extend(e,{finGoodsTasks:{},compTasks:{},finGoodsTotalFte:0,compTotalFte:0,finGoodsAbsenceFte:0,compAbsenceFte:0,finGoodsOutFte:0,finGoodsOutCount:0,finGoodsInFte:0,finGoodsInCount:0,fixBinFte:0,fixBinCount:0,paintFte:0,paintCount:0,smFte:0,smCount:0,stagingFte:0,stagingCount:0,fifoFte:0,fifoCount:0,exStorageInCount:0,exStorageOutCount:0,exStorageFte:0,coopCompFte:0,coopComp541Count:0,coopComp344Count:0,coopComp343Count:0,inCompFte:0,inCompCount:0})},calcNormalTaskFte:function(e,o,s){t.forEach(o.compTasks,function(t,a){t/=s,a="comp-"+a,void 0===e.fte[a]&&(e.fte[a]=0,e.effAndFte[a]={eff:[],fte:[]}),e.fte[a]+=t,e.effAndFte[a].fte.push({x:o.key,y:n(t)})}),t.forEach(o.finGoodsTasks,function(t,a){t/=s,a="finGoods-"+a,void 0===e.fte[a]&&(e.fte[a]=0,e.effAndFte[a]={eff:[],fte:[]}),e.fte[a]+=t,e.effAndFte[a].fte.push({x:o.key,y:n(t)})})},calcExTransactions:function(t,e,o){var s=e.key;t.effAndFte.inComp.eff.push({x:s,y:n(e.inCompCount/e.inCompFte)}),t.effAndFte.inComp.fte.push({x:s,y:e.inCompFte/o}),t.count.inComp+=e.inCompCount;var a=e.coopComp344Count+e.coopComp343Count,f=e.coopComp541Count+a;t.effAndFte.coopComp.eff.push({x:s,y:n(f/e.coopCompFte)}),t.effAndFte.coopComp.fte.push({x:s,y:e.coopCompFte/o}),t.count.coopComp541+=e.coopComp541Count,t.count.coopCompProcessing+=a;var i=e.exStorageInCount+e.exStorageOutCount;t.effAndFte.exStorage.eff.push({x:s,y:n(i/e.exStorageFte)}),t.effAndFte.exStorage.fte.push({x:s,y:e.exStorageFte/o}),t.count.exStorageIn+=e.exStorageInCount,t.count.exStorageOut+=e.exStorageOutCount;var c=e.inCompCount+f+i,r=e.inCompFte+e.coopCompFte+e.exStorageFte;t.effAndFte.exTransactions.eff.push({x:s,y:n(c/r)}),t.effAndFte.exTransactions.fte.push({x:s,y:r/o})},calcInTransactions:function(t,e,o){t.count.staging+=e.stagingCount,t.count.fifo+=e.fifoCount,t.count.paint+=e.paintCount,t.count.fixBin+=e.fixBinCount;var s=e.stagingCount+e.fifoCount+e.paintCount+e.fixBinCount,a=e.stagingFte+e.fifoFte+e.paintFte+e.fixBinFte,f=a;t.effAndFte.inTransactions.eff.push({x:e.key,y:n(s/a)}),t.effAndFte.inTransactions.fte.push({x:e.key,y:f/o})},calcEffAndFte:function(t,e,o,s,a){void 0===t.effAndFte[o]&&(t.effAndFte[o]={fte:[],eff:[]});var f=e[o+"Count"],i=e[o+"Fte"];a||t.effAndFte[o].eff.push({x:e.key,y:n(f/i)}),t.effAndFte[o].fte.push({x:e.key,y:i/s})},calcFifo:function(e,o,n,s){this.calcEffAndFte(e,o,"fifo",s),t.forEach(n,function(t){var n=o.compTasks[t];null!=n&&(null==e.fte.fifo[t]?e.fte.fifo[t]=n/s:e.fte.fifo[t]+=n/s)})},calcAbsence:function(e,o,s,a,f){var i=o.compTotalFte+o.finGoodsTotalFte,c=o.compAbsenceFte+o.finGoodsAbsenceFte;e.totalAndAbsence.total.fte.push({x:o.key,y:i/f}),e.totalAndAbsence.total.absence.push({x:o.key,y:n(100*c/i)}),e.totalAndAbsence.comp.fte.push({x:o.key,y:o.compTotalFte/f}),e.totalAndAbsence.comp.absence.push({x:o.key,y:n(100*o.compAbsenceFte/o.compTotalFte)}),e.totalAndAbsence.finGoods.fte.push({x:o.key,y:o.finGoodsTotalFte/f}),e.totalAndAbsence.finGoods.absence.push({x:o.key,y:n(100*o.finGoodsAbsenceFte/o.finGoodsTotalFte)}),t.forEach(s,function(t){void 0===e.fte.totalAbsence[t]&&(e.fte.totalAbsence[t]=0),void 0===e.fte.compAbsence[t]&&(e.fte.compAbsence[t]=0);var n=o.compTasks[t]||0;e.fte.totalAbsence[t]+=n/f,e.fte.compAbsence[t]+=n/f}),t.forEach(a,function(t){void 0===e.fte.totalAbsence[t]&&(e.fte.totalAbsence[t]=0),void 0===e.fte.finGoodsAbsence[t]&&(e.fte.finGoodsAbsence[t]=0);var n=o.finGoodsTasks[t]||0;e.fte.totalAbsence[t]+=n/f,e.fte.finGoodsAbsence[t]+=n/f})}})});