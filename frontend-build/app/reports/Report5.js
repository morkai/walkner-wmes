// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../data/companies","../data/prodFunctions","../core/Model"],function(t,n,r,i){"use strict";return i.extend({urlRoot:"/reports/5",defaults:function(){return{orgUnitType:null,orgUnit:null,prodTasks:{},totals:{quantityDone:[],total:[],direct:[],indirect:[],byCompany:{}},maxTotals:{quantityDone:0,total:0,direct:0,indirect:0},directByCompany:{},indirectBycompany:{},indirDir:[],maxDirIndir:0,byCompanyAndProdFunction:{},dirIndir:{quantityDone:0,efficiencyNum:0,laborSetupTime:0,productivity:0,productivityNoWh:0,direct:0,indirect:0,indirectProdFlow:0,directByProdFunction:{},indirectByProdFunction:{},production:0,storage:0,storageByProdTasks:{}},effIneff:{value:0,efficiency:0,dirIndir:0,prodFlow:0,prodTasks:{}}}},initialize:function(t,n){if(!n.query)throw new Error("query option is required!");this.query=n.query},getDirectRef:function(t){if(!t)return null;var n=this.get("dirIndir");return n.efficiencyNum*t+n.laborSetupTime||null},getIndirectRef:function(t,n){if(!t||!n)return null;var r=this.get("dirIndir").production,i=this.get("effIneff").prodTasks,e=i[t]||0;return(r-e)*n||null},getWarehouseRef:function(t){if(!t)return null;var n=this.get("dirIndir").direct;return n*t||null},getDirIndirRef:function(t){if(!t)return null;var n=this.get("effIneff");return n.prodFlow*t||null},getAbsenceRef:function(t){if(!t)return null;var n=this.get("dirIndir");return(n.production+n.storage)*t||null},fetch:function(n){return t.isObject(n)||(n={}),n.data=t.extend(n.data||{},this.query.serializeToObject(this.get("orgUnitType"),this.get("orgUnit"))),i.prototype.fetch.call(this,n)},parse:function(t){var i={prodTasks:t.options.prodTasks,raw:t.data,totals:{quantityDone:[],total:[],direct:[],indirect:[],byCompany:{}},maxTotals:{quantityDone:0,total:0,direct:0,indirect:0},directByCompany:{},indirectByCompany:{},indirDir:[],maxDirIndir:0,byCompanyAndProdFunction:{},dirIndir:null,effIneff:null};this.parseDirIndir(t.dirIndir,i),this.parseEffIneff(t.effIneff,i);for(var e,o=i.totals,a=i.maxTotals,d=n.map(function(t){return o.byCompany[t.id]=[],i.directByCompany[t.id]=[],i.indirectByCompany[t.id]=[],i.byCompanyAndProdFunction[t.id]={},t.id}),u=d.length,c=r.map(function(t){return d.forEach(function(n){i.byCompanyAndProdFunction[n][t.id]=0}),t.id}),f=c.length,y=0,s=0,p=t.data.length;p>s;++s){var l,h=t.data[s],m=0,g=0,v=0,I=0,C={},x={},b={};if("number"==typeof h)l=h;else{for(var F=h.dni,D=0;f>D;++D){var T=c[D],k=F[T];if(void 0!==k)for(var M=0;u>M;++M){e=d[M];var q=k[e];if(void 0!==q){var B=q[0],P=q[1],E=B+P;g+=E,v+=B,I+=P,void 0===C[e]?(C[e]=E,x[e]=B,b[e]=P):(C[e]+=E,x[e]+=B,b[e]+=P),i.byCompanyAndProdFunction[e][T]+=E}}}m=h.qty,l=h.key}var A=t.days[l]||1;A>1&&(g/=A,v/=A,I/=A),y+=A;var j=g?I/g*100:0;o.quantityDone.push({x:l,y:m}),o.total.push({x:l,y:g}),o.direct.push({x:l,y:v}),o.indirect.push({x:l,y:I}),i.indirDir.push({x:l,y:j});for(var O=0;u>O;++O)e=d[O],o.byCompany[e].push({x:l,y:(C[e]||0)/A}),i.directByCompany[e].push({x:l,y:(x[e]||0)/A}),i.indirectByCompany[e].push({x:l,y:(b[e]||0)/A});m>a.quantityDone&&(a.quantityDone=m),g>a.total&&(a.total=g),v>a.direct&&(a.direct=v),I>a.indirect&&(a.indirect=I),j>i.maxDirIndir&&(i.maxDirIndir=j)}return y>1&&d.forEach(function(t){c.forEach(function(n){i.byCompanyAndProdFunction[t][n]/=y})}),i},parseDirIndir:function(t,n){t.productivity=Math.round(100*t.productivity),t.productivityNoWh=Math.round(100*t.productivityNoWh),t.direct=Math.round(10*t.direct)/10,t.indirect=Math.round(10*t.indirect)/10,n.dirIndir=t},parseEffIneff:function(t,n){t.value=Math.round(10*t.value)/10,t.dirIndir=Math.round(10*t.dirIndir)/10,Object.keys(t.prodTasks).forEach(function(n){t.prodTasks[n]=Math.round(10*t.prodTasks[n])/10}),n.effIneff=t},getMaxEffIneffProdTaskFte:function(t){var n=this.get("effIneff").prodTasks,r=0;return Object.keys(n).forEach(function(i){var e=n[i];e>r&&t[i]&&(r=e)}),r},getMaxCompanyFte:function(t,n){var r=0;return Object.keys(n).forEach(function(i){var e=n[i];t[i]&&e>r&&(r=e)}),r},getMaxTotalCompanyFte:function(t){return this.getMaxCompanyFte(t,this.get("totals").byCompany)},getMaxDirectCompanyFte:function(t){return this.getMaxCompanyFte(t,this.get("directByCompany"))},getMaxIndirectCompanyFte:function(t){return this.getMaxCompanyFte(t,this.get("indirectByCompany"))},getMaxFteByCompanyAndProdFunction:function(t,n){var r=0,i=this.get("byCompanyAndProdFunction");return Object.keys(i).forEach(function(e){if(t[e]){var o=i[e];Object.keys(o).forEach(function(t){var i=o[t];n[t]&&i>r&&(r=i)})}}),r}})});