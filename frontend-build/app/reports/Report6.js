// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../i18n","../data/orgUnits","../data/views/renderOrgUnitPath","../core/Model"],function(o,e,t,n,s){function c(o){return isNaN(o)||!isFinite(o)?0:Math.round(100*o)/100}return s.extend({urlRoot:"/reports/6",defaults:function(){return{}},initialize:function(o,e){if(!e.query)throw new Error("query option is required!");this.query=e.query},fetch:function(e){return o.isObject(e)||(e={}),e.data=o.extend(e.data||{},this.query.serializeToObject()),s.prototype.fetch.call(this,e)},parse:function(e){var t={settings:e.options.settings,prodTasks:e.options.prodTasks,effAndFte:{inComp:{fte:[],eff:[]},coopComp:{fte:[],eff:[]},exStorage:{fte:[],eff:[]},exTransactions:{fte:[],eff:[]}},category:{coopComp:[],exStorage:[],exTransactions:[],fifo:[],totalAbsence:[],compAbsence:[],finGoodsAbsence:[]},totalAndAbsence:{total:{fte:[],absence:[]},comp:{fte:[],absence:[]},finGoods:{fte:[],absence:[]}},fte:{fifo:{},totalAbsence:{},compAbsence:{},finGoodsAbsence:{}},count:{inComp:0,coopComp541:0,coopCompProcessing:0,exStorageOut:0,exStorageIn:0,fifo:0,staging:0,sm:0,paint:0,fixBin:0,finGoodsIn:0,finGoodsOut:0}},n=[],s=t.settings["fifo.prodTask"],c=[],a=t.settings["compAbsence.prodTask"],f=[],i=t.settings["finGoodsAbsence.prodTask"];o.forEach(t.prodTasks,function(o,e){o.parent===s&&n.push(e),o.parent===a&&c.push(e),o.parent===i&&f.push(e)});for(var r=0,p=e.data.length;p>r;++r){var u=e.data[r];void 0===u.compTasks&&this.prepareEmptyGroupData(u),this.calcExTransactions(t,u),this.calcFifo(t,u,n),this.calcEffAndFte(t,u,"staging"),this.calcEffAndFte(t,u,"sm"),this.calcEffAndFte(t,u,"paint"),this.calcEffAndFte(t,u,"fixBin"),this.calcEffAndFte(t,u,"finGoodsIn"),this.calcEffAndFte(t,u,"finGoodsOut"),this.calcAbsence(t,u,c,f)}return t.category.coopComp.push(this.createCategoryPoint("coopComp541",t.count.coopComp541),this.createCategoryPoint("coopCompProcessing",t.count.coopCompProcessing)),t.category.exStorage.push(this.createCategoryPoint("exStorageIn",t.count.exStorageIn),this.createCategoryPoint("exStorageOut",t.count.exStorageOut)),t.category.exTransactions.push(this.createCategoryPoint("inComp",t.count.inComp),this.createCategoryPoint("coopComp",t.count.coopComp541+t.count.coopCompProcessing),this.createCategoryPoint("exStorage",t.count.exStorageIn+t.count.exStorageOut)),this.createFteCategoryPoints(t,"fifo"),this.createFteCategoryPoints(t,"totalAbsence"),this.createFteCategoryPoints(t,"compAbsence"),this.createFteCategoryPoints(t,"finGoodsAbsence"),t},createCategoryPoint:function(o,t){return{name:e("reports","wh:category:name:"+o),y:t}},createFteCategoryPoints:function(e,t){o.forEach(e.fte[t],function(o,n){var s=e.prodTasks[n];e.category[t].push({name:s.name,y:o,color:s.color})})},prepareEmptyGroupData:function(e){return o.extend(e,{finGoodsTasks:{},compTasks:{},finGoodsTotalFte:0,compTotalFte:0,finGoodsAbsenceFte:0,compAbsenceFte:0,finGoodsOutFte:0,finGoodsOutCount:0,finGoodsInFte:0,finGoodsInCount:0,fixBinFte:0,fixBinCount:0,paintFte:0,paintCount:0,smFte:0,smCount:0,stagingFte:0,stagingCount:0,fifoFte:0,fifoCount:0,exStorageInCount:0,exStorageOutCount:0,exStorageFte:0,coopCompFte:0,coopComp541Count:0,coopComp344Count:0,coopComp343Count:0,inCompFte:0,inCompCount:0})},calcExTransactions:function(o,e){var t=e.key;o.effAndFte.inComp.eff.push({x:t,y:c(e.inCompCount/e.inCompFte)}),o.effAndFte.inComp.fte.push({x:t,y:e.inCompFte}),o.count.inComp+=e.inCompCount;var n=e.coopComp344Count+e.coopComp343Count,s=e.coopComp541Count+n;o.effAndFte.coopComp.eff.push({x:t,y:c(s/e.coopCompFte)}),o.effAndFte.coopComp.fte.push({x:t,y:e.coopCompFte}),o.count.coopComp541+=e.coopComp541Count,o.count.coopCompProcessing+=n;var a=e.exStorageInCount+e.exStorageOutCount;o.effAndFte.exStorage.eff.push({x:t,y:c(a/e.exStorageFte)}),o.effAndFte.exStorage.fte.push({x:t,y:e.exStorageFte}),o.count.exStorageIn+=e.exStorageInCount,o.count.exStorageOut+=e.exStorageOutCount;var f=e.inCompCount+s+a,i=e.inCompFte+e.coopCompFte+e.exStorageFte;o.effAndFte.exTransactions.eff.push({x:t,y:c(f/i)}),o.effAndFte.exTransactions.fte.push({x:t,y:i})},calcEffAndFte:function(o,e,t){void 0===o.effAndFte[t]&&(o.effAndFte[t]={fte:[],eff:[]});var n=e[t+"Count"],s=e[t+"Fte"];o.effAndFte[t].eff.push({x:e.key,y:c(n/s)}),o.effAndFte[t].fte.push({x:e.key,y:s})},calcFifo:function(e,t,n){this.calcEffAndFte(e,t,"fifo"),o.forEach(n,function(o){var n=t.compTasks[o];void 0!=n&&(void 0===e.fte.fifo[o]?e.fte.fifo[o]=n:e.fte.fifo[o]+=n)})},calcAbsence:function(e,t,n,s){var a=t.compTotalFte+t.finGoodsTotalFte,f=t.compAbsenceFte+t.finGoodsAbsenceFte;e.totalAndAbsence.total.fte.push({x:t.key,y:a}),e.totalAndAbsence.total.absence.push({x:t.key,y:c(100*f/a)}),e.totalAndAbsence.comp.fte.push({x:t.key,y:t.compTotalFte}),e.totalAndAbsence.comp.absence.push({x:t.key,y:c(100*t.compAbsenceFte/t.compTotalFte)}),e.totalAndAbsence.finGoods.fte.push({x:t.key,y:t.finGoodsTotalFte}),e.totalAndAbsence.finGoods.absence.push({x:t.key,y:c(100*t.finGoodsAbsenceFte/t.finGoodsTotalFte)}),o.forEach(n,function(o){void 0===e.fte.totalAbsence[o]&&(e.fte.totalAbsence[o]=0),void 0===e.fte.compAbsence[o]&&(e.fte.compAbsence[o]=0);var n=t.compTasks[o]||0;e.fte.totalAbsence[o]+=n,e.fte.compAbsence[o]+=n}),o.forEach(s,function(o){void 0===e.fte.totalAbsence[o]&&(e.fte.totalAbsence[o]=0),void 0===e.fte.finGoodsAbsence[o]&&(e.fte.finGoodsAbsence[o]=0);var n=t.finGoodsTasks[o]||0;e.fte.totalAbsence[o]+=n,e.fte.finGoodsAbsence[o]+=n})}})});