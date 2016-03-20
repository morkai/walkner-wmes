// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../core/Model"],function(e,t,r){"use strict";function n(e,t){var r=new RegExp("^("+t.replace(/ /g,"|")+")");return function(n){if(""===t)return!0;var o=r.test(n);return"inclusive"===e&&o||"exclusive"===e&&!o}}var o="WMES:DOCS";return r.extend({defaults:function(){return{prodLine:{_id:null,name:""},localServerUrl:"http://127.0.0.1:1335",localServerPath:"",prefixFilterMode:"exclusive",prefixFilter:"161 165 198",localOrder:{no:null,nc12:"",name:"",documents:{},nc15:null},remoteOrder:{no:null,nc12:"",name:"",documents:{},nc15:null},localFile:null,fileSource:null}},initialize:function(){this.on("change:prefixFilterMode change:prefixFilter",function(){this.filterNc15=n(this.get("prefixFilterMode"),this.get("prefixFilter"))})},load:function(){this.set(JSON.parse(localStorage.getItem(o)||"{}"))},save:function(){var e={prodLine:this.get("prodLine"),localOrder:this.get("localOrder"),remoteOrder:this.get("remoteOrder"),prefixFilterMode:this.get("prefixFilterMode"),prefixFilter:this.get("prefixFilter")};localStorage.setItem(o,JSON.stringify(e)),this.trigger("save")},filterNc15:function(){return!0},selectDocument:function(t){var r=this.get("localOrder"),n=this.get("remoteOrder"),o=r.no?"localOrder":"remoteOrder",c=r.no?r:n;if(c.documents[t]){var i={localFile:null};i[o]=e.defaults({nc15:t},c),this.set(i),this.save()}},getSettings:function(){var e=this.get("prodLine");return{prodLineId:e._id,prodLineName:e.name,prefixFilterMode:this.get("prefixFilterMode"),prefixFilter:this.get("prefixFilter"),localServerUrl:this.get("localServerUrl"),localServerPath:this.get("localServerPath")}},getCurrentOrder:function(){var e=this.get("localOrder");return e.no?e:this.get("remoteOrder")},getCurrentOrderInfo:function(){var e={fileSource:this.get("fileSource"),orderNo:null,orderNc12:null,orderName:null,documentNc15:null,documentName:null},r=this.getCurrentOrder(),n=this.get("localFile");if(r.no?(e.orderNo=r.no,e.orderNc12=r.nc12,e.orderName=r.name):(e.orderNo=t("orderDocuments","controls:emptyOrderNo"),e.orderName=t("orderDocuments","controls:emptyOrderName")),n){var o=n.name.replace(/_/g," ").replace(/\s+/g," ").trim().match(/^([0-9]+)?(.*?)?\.pdf$/i),c=(o[1]||"").trim(),i=(o[2]||"").trim();e.documentNc15=c||t("orderDocuments","controls:localDocumentNc15"),e.documentName=i||t("orderDocuments","controls:localDocumentName")}else{var l=r.documents[r.nc15];l?(e.documentNc15=r.nc15,e.documentName=l):(e.documentNc15=t("orderDocuments","controls:emptyDocumentNc15"),e.documentName=t("orderDocuments","controls:emptyDocumentName"))}return e},getLocalFileUrl:function(t){var r=this.get("localServerUrl");if(e.isEmpty(r))return null;var n=this.get("localServerPath");if("/"!==r.substr(-1)&&(r+="/"),e.isEmpty(n))return r+t;var o=n.substr(-1);return"/"!==o&&"\\"!==o&&(n+="/"),r+encodeURIComponent(n+t+".pdf")},getRemoteFileUrl:function(e){return window.location.origin+"/orderDocuments/"+e},setRemoteOrder:function(e){this.setOrder("remoteOrder",e)},setLocalOrder:function(e){this.setOrder("localOrder",e)},resetLocalOrder:function(){this.set("localOrder",{no:null,nc12:"",name:"",documents:{},nc15:null}),this.save()},setLocalFile:function(e,t){this.set({nc15:null,localFile:{name:e,file:t}}),this.save()},resetLocalFile:function(){this.set("localFile",null),this.save()},setFileSource:function(e){this.set("fileSource",e),this.save()},setOrder:function(r,n){var o=this.get(r),c={no:n.no,nc12:n.nc12,name:n.name,documents:{},nc15:null};if(n.hasBom&&(c.documents.BOM=t("orderDocuments","bom")),n.hasEto&&(c.documents.ETO=t("orderDocuments","eto")),e.extend(c.documents,n.documents),c.no===o.no&&c.documents[o.nc15])c.nc15=o.nc15;else{var i=Object.keys(c.documents).filter(this.filterNc15);i.length&&(c.nc15=i[0])}this.set(r,c),o.no!==c.no&&this.trigger("change:"+r+":no",o.no,c.no)},checkEtoExistence:function(e){var t=!!this.get("localOrder").no,r=this.checkEtoInOrder(e,this.get("localOrder")),n=this.checkEtoInOrder(e,this.get("remoteOrder"));(r||n&&!t)&&this.trigger("change:documents")},checkEtoInOrder:function(r,n){if(n.nc12!==r)return!1;if(n.documents.ETO)return!1;var o=Object.keys(n.documents),c={};return n.documents.BOM&&(c.BOM=n.documents.BOM,o.shift()),c.ETO=t("orderDocuments","eto"),e.forEach(o,function(e){c[e]=n.documents[e]}),n.documents=c,!0}})});