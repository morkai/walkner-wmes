// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["moment","app/i18n","app/data/subdivisions","app/data/views/renderOrgUnitPath","app/core/util/bindLoadingMessage","app/core/View","../FteLeaderEntry","../views/FteLeaderEntryDetailsPrintableView"],function(e,t,i,n,d,a,r,o){return a.extend({layoutName:"print",pageId:"fteLeaderEntryDetailsPrintable",hdLeft:function(){var e=i.get(this.model.get("subdivision"));return t("fte","print:hdLeft",{subdivision:e?n(e,!1,!1):"?"})},hdRight:function(){return t("fte","print:hdRight",{date:e(this.model.get("date")).format("YYYY-MM-DD"),shift:t("core","SHIFT:"+this.model.get("shift"))})},initialize:function(){this.model=d(new r({_id:this.options.modelId}),this),this.view=new o({model:this.model})},load:function(e){return e(this.model.fetch())}})});