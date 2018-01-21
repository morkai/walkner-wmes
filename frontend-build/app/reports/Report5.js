// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../data/companies","../data/prodFunctions","../core/Model"],function(t,n,r,i){"use strict";return i.extend({urlRoot:"/reports/5",defaults:function(){return{orgUnitType:null,orgUnit:null,prodTasks:{},totals:{quantityDone:[],total:[],direct:[],indirect:[],byCompany:{}},maxTotals:{quantityDone:0,total:0,direct:0,indirect:0},directByCompany:{},indirectBycompany:{},indirDir:[],maxDirIndir:0,byCompanyAndProdFunction:{},dirIndir:{quantityDone:0,efficiencyNum:0,laborSetupTime:0,productivity:0,productivityNoWh:0,direct:0,indirect:0,indirectProdFlow:0,directByProdFunction:{},indirectByProdFunction:{},production:0,storage:0,storageByProdTasks:{}},effIneff:{value:0,efficiency:0,dirIndir:0,prodFlow:0,prodTasks:{}},attendance:{}}},initialize:function(t,n){if(!n.query)throw new Error("query option is required!");this.query=n.query},getDirectRef:function(t){if(!t)return null;var n=this.get("dirIndir");return n.efficiencyNum*t+n.laborSetupTime||null},getIndirectRef:function(t,n){if(!t||!n)return null;var r=this.get("dirIndir").production,i=this.get("effIneff").prodTasks,e=i[t]||0;return(r-e)*n||null},getWarehouseRef:function(t){if(!t)return null;var n=this.get("dirIndir").direct;return n*t||null},getDirIndirRef:function(t){if(!t)return null;var n=this.get("effIneff");return n.prodFlow*t||null},getAbsenceRef:function(t){if(!t)return null;var n=this.get("dirIndir");return(n.production+n.storage)*t||null},fetch:function(n){return t.isObject(n)||(n={}),n.data=t.extend(n.data||{},this.query.serializeToObject(this.get("orgUnitType"),this.get("orgUnit"))),i.prototype.fetch.call(this,n)},parse:function(t){var i={prodTasks:t.options.prodTasks,raw:t.data,totals:{quantityDone:[],total:[],direct:[],indirect:[],byCompany:{}},maxTotals:{quantityDone:0,total:0,direct:0,indirect:0},directByCompany:{},indirectByCompany:{},indirDir:[],maxDirIndir:0,byCompanyAndProdFunction:{},dirIndir:null,effIneff:null,totalAttendance:t.attendance,attendance:[]};this.parseDirIndir(t.dirIndir,i),this.parseEffIneff(t.effIneff,i);var e,o=i.totals,a=i.maxTotals,d=n.map(function(t){return o.byCompany[t.id]=[],i.directByCompany[t.id]=[],i.indirectByCompany[t.id]=[],i.byCompanyAndProdFunction[t.id]={},t.id}),c=d.length,u=r.map(function(t){return d.forEach(function(n){i.byCompanyAndProdFunction[n][t.id]=0}),t.id}),f=u.length,y=0,s={};d.forEach(function(n){t.attendance[n]&&(s[n]={demand:0,supply:0,shortage:0,absence:0})});for(var p=0,l=t.data.length;p<l;++p){var h,m=t.data[p],g=0,v=0,I=0,x=0,C={},b={},F={},D=s;if("number"==typeof m)h=m;else{for(var T=m.dni,M=0;M<f;++M){var k=u[M],q=T[k];if(void 0!==q)for(var B=0;B<c;++B){e=d[B];var E=q[e];if(void 0!==E){var P=E[0],A=E[1],j=P+A;v+=j,I+=P,x+=A,void 0===C[e]?(C[e]=j,b[e]=P,F[e]=A):(C[e]+=j,b[e]+=P,F[e]+=A),i.byCompanyAndProdFunction[e][k]+=j}}}g=m.qty,h=m.key,D=m.attendance}var O=t.days[h]||1;O>1&&(v/=O,I/=O,x/=O),y+=O;var w=v?x/v*100:0;o.quantityDone.push({x:h,y:g}),o.total.push({x:h,y:v}),o.direct.push({x:h,y:I}),o.indirect.push({x:h,y:x}),i.indirDir.push({x:h,y:w}),i.attendance.push({x:h,y:D});for(var R=0;R<c;++R)e=d[R],o.byCompany[e].push({x:h,y:(C[e]||0)/O}),i.directByCompany[e].push({x:h,y:(b[e]||0)/O}),i.indirectByCompany[e].push({x:h,y:(F[e]||0)/O});g>a.quantityDone&&(a.quantityDone=g),v>a.total&&(a.total=v),I>a.direct&&(a.direct=I),x>a.indirect&&(a.indirect=x),w>i.maxDirIndir&&(i.maxDirIndir=w)}return y>1&&d.forEach(function(t){u.forEach(function(n){i.byCompanyAndProdFunction[t][n]/=y})}),i},parseDirIndir:function(t,n){t.productivity=Math.round(100*t.productivity),t.productivityNoWh=Math.round(100*t.productivityNoWh),t.direct=Math.round(10*t.direct)/10,t.indirect=Math.round(10*t.indirect)/10,n.dirIndir=t},parseEffIneff:function(t,n){t.value=Math.round(10*t.value)/10,t.dirIndir=Math.round(10*t.dirIndir)/10,Object.keys(t.prodTasks).forEach(function(n){t.prodTasks[n]=Math.round(10*t.prodTasks[n])/10}),n.effIneff=t},getMaxEffIneffProdTaskFte:function(t){var n=this.get("effIneff").prodTasks,r=0;return Object.keys(n).forEach(function(i){var e=n[i];e>r&&t[i]&&(r=e)}),r},getMaxCompanyFte:function(t,n){var r=0;return Object.keys(n).forEach(function(i){var e=n[i];t[i]&&e>r&&(r=e)}),r},getMaxTotalCompanyFte:function(t){return this.getMaxCompanyFte(t,this.get("totals").byCompany)},getMaxDirectCompanyFte:function(t){return this.getMaxCompanyFte(t,this.get("directByCompany"))},getMaxIndirectCompanyFte:function(t){return this.getMaxCompanyFte(t,this.get("indirectByCompany"))},getMaxFteByCompanyAndProdFunction:function(t,n){var r=0,i=this.get("byCompanyAndProdFunction");return Object.keys(i).forEach(function(e){if(t[e]){var o=i[e];Object.keys(o).forEach(function(t){var i=o[t];n[t]&&i>r&&(r=i)})}}),r},getMaxAttendance:function(n){var r=0;return t.forEach(this.get("attendance"),function(t,i){n[i]&&(r=Math.max(r,t.demand,t.absence))}),r}})});