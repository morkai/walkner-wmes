// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../i18n","../time","../core/Model","../core/util/getShiftStartInfo"],function(r,e,t,o){"use strict";function s(r){return r&&r.label?r.label:null}return t.extend({urlRoot:"/pressWorksheets",clientUrlRoot:"#pressWorksheets",topicPrefix:"pressWorksheets",privilegePrefix:"PRESS_WORKSHEETS",nlsDomain:"pressWorksheets",labelAttribute:"rid",defaults:function(){var r=o(Date.now());return{rid:null,date:e.format(r.moment.valueOf(),"YYYY-MM-DD"),shift:r.shift,type:"mech",divisions:[],prodLines:[],startedAt:null,finishedAt:null,master:null,operator:null,operators:null,orders:null,createdAt:null,creator:null}},serialize:function(){var t=this.toJSON();if(t.date=e.format(t.date,"LL"),t.shift=r("core","SHIFT:"+t.shift),t.master=s(t.master),t.operator=s(t.operator),t.operators=(t.operators||[]).map(s).filter(function(r){return!!r}),t.creator=s(t.creator),t.createdAt=t.createdAt?e.format(t.createdAt,"LLLL"):null,t.losses=this.hasAnyLosses(),t.laborManHours=0,t.machineManHours=0,t.orders){var o="paintShop"===t.type;t.orders=t.orders.map(function(r){o&&(r.startedAt=e.getMoment(r.startedAt).format("LTS"),r.finishedAt=e.getMoment(r.finishedAt).format("LTS"));var s=r.orderData.operations[r.operationNo];return s&&(r.laborManHours=s.laborTime/100*r.quantityDone,r.machineManHours=s.machineTime/100*r.quantityDone,t.laborManHours+=r.laborManHours,t.machineManHours+=r.machineManHours),r})}return Array.isArray(t.divisions)&&(t.divisions=t.divisions.join("; ")),Array.isArray(t.prodLines)&&(t.prodLines=t.prodLines.join("; ")),t.type=r("pressWorksheets","PROPERTY:type:"+t.type),t},hasAnyLosses:function(){for(var r=this.get("orders")||[],e=0;e<r.length;++e){var t=r[e];if(Array.isArray(t.losses)&&t.losses.length)return!0}return!1}})});