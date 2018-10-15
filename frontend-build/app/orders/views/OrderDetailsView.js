// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/views/DetailsView","app/orders/templates/details"],function(e,t,i){"use strict";return t.extend({template:i,remoteTopics:{},localTopics:{"orderStatuses.synced":"render"},getTemplateData:function(){return{model:this.model.serialize({delayReasons:this.delayReasons}),panelType:this.options.panelType||"primary",panelTitle:this.options.panelTitle||e("orders","PANEL:TITLE:details"),linkOrderNo:!!this.options.linkOrderNo}}})});