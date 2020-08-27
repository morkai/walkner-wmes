define(["underscore","app/i18n","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/pageActions","../RearmReport","../views/rearm/FilterView","../views/rearm/LineView","app/reports/templates/rearm/page"],function(e,t,i,r,n,o,a,s,m,l){"use strict";return r.extend({layoutName:"page",template:l,breadcrumbs:function(){return[this.t("rearm:breadcrumb")]},actions:function(){return[{icon:"download",label:this.t("core","PAGE_ACTION:export"),callback:this.export.bind(this)}]},initialize:function(){this.model=n(this.model,this),this.setView("#-filter",new s({model:this.model})),this.listenTo(this.model,"filtered",this.onFiltered),this.listenToOnce(this,"afterRender",function(){this.listenTo(this.model.lines,"reset",function(){this.renderLines(!0)})})},load:function(e){return e(this.model.fetch())},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})},beforeRender:function(){this.renderLines(!1)},renderLines:function(e){var t=this;t.removeView("#-lines"),t.model.lines.forEach(function(i){var r=new m({model:t.model,line:i});t.insertView("#-lines",r),e&&r.render()})},export:function(){var e=this;i.msg.loading();var t={line:{type:"string",width:10,caption:e.t("rearm:column:line"),position:1},orderNo:{type:"string",width:10,caption:e.t("rearm:column:orderNo")},mrp:{type:"string",width:5,caption:e.t("rearm:column:mrp")},shiftAt:{type:"date",caption:e.t("rearm:column:date")},shiftNo:{type:"integer",width:7,caption:e.t("rearm:column:shift")},startedAt:{type:"time",caption:e.t("rearm:column:startedAt")},finishedAt:{type:"time",caption:e.t("rearm:column:finishedAt")},firstAt:{type:"time",caption:e.t("rearm:column:firstAt")},lastAt:{type:"time",caption:e.t("rearm:column:lastAt")},avgTaktTime:{type:"integer",width:8,caption:e.t("rearm:column:avgTaktTime")},idle:{type:"integer",width:8,caption:e.t("rearm:column:idle")},downtime:{type:"integer",width:8,caption:e.t("rearm:column:downtime")},metric1:{type:"integer",width:8,caption:e.t("rearm:column:metric1")},metric2:{type:"integer",width:8,caption:e.t("rearm:column:metric2")}},r=[];e.model.lines.forEach(function(e){r=r.concat(e.get("orders"))});var n=e.ajax({type:"POST",url:"/xlsxExporter",data:JSON.stringify({filename:e.t("rearm:export:fileName"),sheetName:e.t("rearm:export:sheetName"),columns:t,data:r})});n.fail(function(){i.msg.loaded(),i.msg.show({type:"error",time:2500,text:e.t("MESSAGE:EXPORTING_FAILURE")})}),n.done(function(e){i.msg.loaded(),o.exportXlsx("/xlsxExporter/"+e)})}})});