define(["../i18n","../time","../core/Model","../core/util/getShiftStartInfo"],function(e,r,t,s){"use strict";function o(e){return e&&e.label?e.label:null}return t.extend({urlRoot:"/pressWorksheets",clientUrlRoot:"#pressWorksheets",topicPrefix:"pressWorksheets",privilegePrefix:"PRESS_WORKSHEETS",nlsDomain:"pressWorksheets",labelAttribute:"rid",defaults:function(){var e=s(Date.now());return{rid:null,date:r.format(e.moment.valueOf(),"YYYY-MM-DD"),shift:e.no,type:"mech",divisions:[],prodLines:[],startedAt:null,finishedAt:null,master:null,operator:null,operators:null,orders:null,createdAt:null,creator:null}},serialize:function(){var t=this.toJSON();if(t.date=r.format(t.date,"LL"),t.shift=e("core","SHIFT:"+t.shift),t.master=o(t.master),t.operator=o(t.operator),t.operators=(t.operators||[]).map(o).filter(function(e){return!!e}),t.creator=o(t.creator),t.createdAt=t.createdAt?r.format(t.createdAt,"LLLL"):null,t.losses=this.hasAnyLosses(),t.machineManHours=0,t.orders){var s="paintShop"===t.type;t.orders=t.orders.map(function(e){s&&(e.startedAt=r.getMoment(e.startedAt).format("LTS"),e.finishedAt=r.getMoment(e.finishedAt).format("LTS"));var o=e.orderData.operations[e.operationNo];return o&&(t.machineManHours+=e.machineManHours=o.machineTime/100*e.quantityDone),e})}return Array.isArray(t.divisions)&&(t.divisions=t.divisions.join("; ")),Array.isArray(t.prodLines)&&(t.prodLines=t.prodLines.join("; ")),t.type=e("pressWorksheets","PROPERTY:type:"+t.type),t},hasAnyLosses:function(){for(var e=this.get("orders")||[],r=0;r<e.length;++r){var t=e[r];if(Array.isArray(t.losses)&&t.losses.length)return!0}return!1}})});