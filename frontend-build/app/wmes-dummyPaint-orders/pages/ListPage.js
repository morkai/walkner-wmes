define(["app/viewport","app/core/pages/FilteredListPage","app/wmes-dummyPaint-jobs/DpJob","../views/FilterView","../views/ListView","../views/StartJobView","app/wmes-dummyPaint-orders/templates/dictionariesAction"],function(t,e,i,s,a,r,n){"use strict";return e.extend({FilterView:s,ListView:a,actions:function(){var t=this;return[{icon:"play",label:t.t("PAGE_ACTION:startJob"),privileges:"DUMMY_PAINT:WORKER",callback:t.showStartJobDialog.bind(t)},{template:function(){return t.renderPartialHtml(n)},privileges:"DUMMY_PAINT:MANAGE"},{icon:"cogs",label:t.t("PAGE_ACTION:settings"),privileges:"DUMMY_PAINT:MANAGE",href:"#dummyPaint/settings"}]},showStartJobDialog:function(){var e=new r({model:new i});t.showDialog(e,this.t("startJob:title"))}})});