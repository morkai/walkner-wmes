// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../i18n","../data/aors","../data/downtimeReasons","../core/Model"],function(r,n,t,i,e){return e.extend({urlRoot:"/reports/2",defaults:function(){return{orgUnitType:null,orgUnit:null,prodTasks:{},clip:{orderCount:[],production:[],endToEnd:[]},dirIndir:{productivity:0,direct:0,indirect:0,indirectProdFlow:0,directByProdFunction:{},indirectByProdFunction:{},production:0,storage:0,storageByProdTasks:{}},effIneff:{value:0,efficiency:0,dirIndir:0,prodTasks:{}}}},initialize:function(r,n){if(!n.query)throw new Error("query option is required!");this.query=n.query},fetch:function(n){return r.isObject(n)||(n={}),n.data=r.extend(n.data||{},this.query.serializeToObject(this.get("orgUnitType"),this.get("orgUnit"))),e.prototype.fetch.call(this,n)},parse:function(r){return{prodTasks:r.options.prodTasks,clip:this.parseClip(r.clip),dirIndir:this.parseDirIndir(r.dirIndir),effIneff:this.parseEffIneff(r.effIneff)}},parseClip:function(r){var n={orderCount:[],production:[],endToEnd:[]};return r.forEach(function(r){n.orderCount.push({x:r.key,y:r.orderCount||0}),n.production.push({x:r.key,y:Math.round(100*(r.production||0))}),n.endToEnd.push({x:r.key,y:Math.round(100*(r.endToEnd||0))})}),n},parseDirIndir:function(r){return r.productivity=Math.round(100*r.productivity),r.direct=Math.round(10*r.direct)/10,r.indirect=Math.round(10*r.indirect)/10,r},parseEffIneff:function(r){return r.value=Math.round(10*r.value)/10,r.dirIndir=Math.round(10*r.dirIndir)/10,Object.keys(r.prodTasks).forEach(function(n){r.prodTasks[n]=Math.round(10*r.prodTasks[n])/10}),r}})});