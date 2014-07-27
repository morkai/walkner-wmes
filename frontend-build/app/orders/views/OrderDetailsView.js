// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/DetailsView","app/data/orderStatuses","app/orders/templates/details","app/orderStatuses/util/renderOrderStatusLabel"],function(e,t,a,s,r){return t.extend({template:s,localTopics:{"orderStatuses.synced":"render"},serialize:function(){var t=this.model.toJSON();return t.statusLabels=a.findAndFill(t.statuses).map(r).join(""),{model:t,panelType:this.options.panelType||"primary",panelTitle:this.options.panelTitle||e("orders","PANEL:TITLE:details")}}})});