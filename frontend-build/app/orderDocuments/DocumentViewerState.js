// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../i18n","../core/Model"],function(e,r,t){"use strict";function n(e,r){var t=new RegExp("^("+r.replace(/ /g,"|")+")");return function(n){if(""===r)return!0;var o=t.test(n);return"inclusive"===e&&o||"exclusive"===e&&!o}}var o="WMES:DOCS";return t.extend({defaults:function(){return{prodLine:{_id:null,name:""},localServerUrl:"http://127.0.0.1:1335",localServerPath:"",prefixFilterMode:"exclusive",prefixFilter:"161 165 198",localOrder:{no:null,nc12:"",name:"",documents:{},nc15:null},remoteOrder:{no:null,nc12:"",name:"",documents:{},nc15:null},localFile:null,fileSource:null}},initialize:function(){this.on("change:prefixFilterMode change:prefixFilter",function(){this.filterNc15=n(this.get("prefixFilterMode"),this.get("prefixFilter"))})},load:function(){this.set(JSON.parse(localStorage.getItem(o)||"{}"))},save:function(){var e={prodLine:this.get("prodLine"),localOrder:this.get("localOrder"),remoteOrder:this.get("remoteOrder"),prefixFilterMode:this.get("prefixFilterMode"),prefixFilter:this.get("prefixFilter")};localStorage.setItem(o,JSON.stringify(e)),this.trigger("save")},filterNc15:function(){return!0},selectDocument:function(r){var t=this.get("localOrder"),n=this.get("remoteOrder"),o=t.no?"localOrder":"remoteOrder",l=t.no?t:n;if(l.documents[r]){var i={localFile:null};i[o]=e.defaults({nc15:r},l),this.set(i),this.save()}},getSettings:function(){var e=this.get("prodLine");return{prodLineId:e._id,prodLineName:e.name,prefixFilterMode:this.get("prefixFilterMode"),prefixFilter:this.get("prefixFilter"),localServerUrl:this.get("localServerUrl"),localServerPath:this.get("localServerPath")}},getCurrentOrder:function(){var e=this.get("localOrder");return e.no?e:this.get("remoteOrder")},getCurrentOrderInfo:function(){var e={fileSource:this.get("fileSource"),orderNo:null,orderNc12:null,orderName:null,documentNc15:null,documentName:null},t=this.getCurrentOrder(),n=this.get("localFile");if(t.no?(e.orderNo=t.no,e.orderNc12=t.nc12,e.orderName=t.name):(e.orderNo=r("orderDocuments","controls:emptyOrderNo"),e.orderName=r("orderDocuments","controls:emptyOrderName")),n){var o=n.name.replace(/_/g," ").replace(/\s+/g," ").trim().match(/^([0-9]+)?(.*?)?\.pdf$/i),l=(o[1]||"").trim(),i=(o[2]||"").trim();e.documentNc15=l||r("orderDocuments","controls:localDocumentNc15"),e.documentName=i||r("orderDocuments","controls:localDocumentName")}else{var c=t.documents[t.nc15];c?(e.documentNc15=t.nc15,e.documentName=c):(e.documentNc15=r("orderDocuments","controls:emptyDocumentNc15"),e.documentName=r("orderDocuments","controls:emptyDocumentName"))}return e},getLocalFileUrl:function(r){var t=this.get("localServerUrl");if(e.isEmpty(t))return null;var n=this.get("localServerPath");if("/"!==t.substr(-1)&&(t+="/"),e.isEmpty(n))return t+r;var o=n.substr(-1);return"/"!==o&&"\\"!==o&&(n+="/"),t+encodeURIComponent(n+r+".pdf")},getRemoteFileUrl:function(e){return window.location.origin+"/orderDocuments/"+e},setRemoteOrder:function(e){this.setOrder("remoteOrder",e)},setLocalOrder:function(e){this.setOrder("localOrder",e)},resetLocalOrder:function(){this.set("localOrder",{no:null,nc12:"",name:"",documents:{},nc15:null}),this.save()},setLocalFile:function(e,r){this.set({nc15:null,localFile:{name:e,file:r}}),this.save()},resetLocalFile:function(){this.set("localFile",null),this.save()},setFileSource:function(e){this.set("fileSource",e),this.save()},setOrder:function(e,r){var t=this.get(e),n={no:r.no,nc12:r.nc12,name:r.name,documents:r.documents,nc15:null};if(n.no===t.no&&n.documents[t.nc15])n.nc15=t.nc15;else{var o=Object.keys(r.documents).filter(this.filterNc15);o.length&&(n.nc15=o[0])}this.set(e,n),t.no!==n.no&&this.trigger("change:"+e+":no",t.no,n.no)}})});