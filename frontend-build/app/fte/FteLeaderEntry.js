// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../i18n","../time","../data/subdivisions","../data/prodFunctions","../data/views/renderOrgUnitPath","../core/Model","./util/isEditable"],function(i,t,n,e,o,s,a,r){function u(i,t){var n=1-t;return[Math.round(i[0]*n),Math.round(i[1]*n),Math.round(i[2]*n)]}function c(i){return"rgb("+i+")"}var d=[[242,222,222],[217,237,247],[223,240,216],[252,248,227],[238,238,238],[254,229,254]];return a.extend({urlRoot:"/fte/leader",clientUrlRoot:"#fte/leader",topicPrefix:"fte.leader",privilegePrefix:"FTE:LEADER",nlsDomain:"fte",defaults:{subdivision:null,date:null,shift:null,fteDiv:null,tasks:null,createdAt:null,creator:null,updatedAt:null,updater:null},getLabel:function(){return t(this.nlsDomain,"label",{subdivision:this.getSubdivisionPath(),date:n.format(this.get("date"),"LL"),shift:t("core","SHIFT:"+this.get("shift"))})},getSubdivisionPath:function(){var i=e.get(this.get("subdivision"));return i?s(i,!1,!1):"?"},isWithFunctions:function(){var i=this.get("tasks"),t=i[0];return Array.isArray(t.functions)&&t.functions.length>0},isWithDivisions:function(){var i=this.get("fteDiv");return Array.isArray(i)&&i.length>0},serializeWithTotals:function(){return this.isWithFunctions()?this.serializeWithFunctions():this.serializeWithoutFunctions()},serializeWithFunctions:function(){var e={},o={};this.prepareTotalsWithFunctions(e,o);var s=this.serializeTasksWithFunctions(e,o),a=0;return i.forEach(e,function(i){a+=i.total}),{subdivision:this.getSubdivisionPath(),date:n.format(this.get("date"),"LL"),shift:t("core","SHIFT:"+this.get("shift")),divisions:this.get("fteDiv")||[],companyCount:Object.keys(e).length,total:a,totalByCompany:e,totalByProdFunction:o,tasks:s}},prepareTotalsWithFunctions:function(t,n){var e=this.get("tasks");if(this.get("tasks").length){var s={},a=this.get("fteDiv")||[];i.forEach(e[0].functions,function(t){i.forEach(t.companies,function(i){void 0===s[i.id]&&(s[i.id]=Object.keys(s).length)})}),i.forEach(e[0].functions,function(e){var r=o.get(e.id);n[e.id]={prodFunction:r?r.getLabel():e.id,total:0,companies:{}},i.forEach(e.companies,function(o){var r=s[o.id];n[e.id].companies[o.id]={index:r,total:0,divisions:{}},t[o.id]={index:r,name:o.name,total:0,divisions:{}},i.forEach(a,function(i){n[e.id].companies[o.id].divisions[i]=0,t[o.id].divisions[i]=0})})})}},serializeTasksWithFunctions:function(t,n){function e(i,t){h.push(i),i.level=t,i.children=l[i.id]||[],i.hasChildren=i.children.length>0,0===t&&++f,f===d.length&&(f=0),i.backgroundColor=c(u(d[f],.1*t)),i.hasChildren&&(i.children[i.children.length-1].lastChild=!0,i.children.forEach(function(i){e(i,t+1)}))}var o=Object.keys(t),s=this.get("fteDiv")||[],a=[],r={},l={};i.forEach(this.get("tasks"),function(e,u){e.index=u,e.fteDiv=!1,e.totalByCompany={},e.backgroundColor=null,e.level=0,e.last=!1;var c=0===e.childCount;return i.forEach(e.functions,function(a){i.forEach(a.companies,function(r){r.index=o.indexOf(r.id),void 0===e.totalByCompany[r.id]&&(e.totalByCompany[r.id]={index:r.index,total:0,divisions:{}});var u=0,d=e.totalByCompany[r.id].divisions;if(Array.isArray(r.count))e.fteDiv=!0,i.forEach(r.count,function(i){u+=i.value,void 0===d[i.division]&&(d[i.division]=0),d[i.division]+=i.value,c&&(t[r.id].divisions[i.division]+=i.value,n[a.id].companies[r.id].divisions[i.division]+=i.value)});else{u=r.count;var l=r.count/s.length;i.forEach(s,function(i){void 0===d[i]&&(d[i]=0),d[i]+=l,c&&(t[r.id].divisions[i]+=l,n[a.id].companies[r.id].divisions[i]+=l)})}e.totalByCompany[r.id].total+=u,c&&(t[r.id].total+=u,n[a.id].total+=u,n[a.id].companies[r.id].total+=u)})}),r[e.id]=e,e.parent?void(l[e.parent]?l[e.parent].push(e):l[e.parent]=[e]):void a.push(e)});var h=[],f=-1;return a.forEach(function(i){e(i,0)}),h.length&&(h[h.length-1].last=!0),h},serializeWithoutFunctions:function(){var i=this.serializeCompanies();return{subdivision:this.getSubdivisionPath(),date:n.format(this.get("date"),"LL"),shift:t("core","SHIFT:"+this.get("shift")),total:i.reduce(function(i,t){return i+t.total},0),totalByCompany:null,totalByProdFunction:null,companies:i,divisions:this.get("fteDiv")||[],tasks:this.serializeTasksWithoutFunctions()}},serializeCompanies:function(){var t=this.get("tasks");return t.length?i.map(t[0].companies,function(i,n){return i.total=t.reduce(function(i,t){return Array.isArray(t.companies[n].count)?t.companies[n].count.forEach(function(t){i+=t.value}):i+=t.companies[n].count,i},0),i}):[]},serializeTasksWithoutFunctions:function(){return i.map(this.get("tasks"),function(i){return i.total=i.companies.reduce(function(i,t){return Array.isArray(t.count)?t.count.forEach(function(t){i+=t.value}):i+=t.count,i},0),i})},isEditable:function(i){return r(this,i)},handleUpdateMessage:function(i,t){var n=this.get("tasks");if(n){var e=n[i.taskIndex];if(e){if(void 0===i.comment){var o;if(this.isWithFunctions()){var s=e.functions[i.functionIndex];if(!s)return;o=s.companies[i.companyIndex]}else o=e.companies[i.companyIndex];if(!o)return;if("number"==typeof i.divisionIndex){var a=o.count[i.divisionIndex];if(!a)return;a.value=i.newCount}else o.count=i.newCount}else e.comment=i.comment;t||(this.trigger("change:tasks"),this.trigger("change"))}}}})});