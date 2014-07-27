// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/i18n","app/data/subdivisions","app/data/views/renderOrgUnitPath","app/core/util/bindLoadingMessage","app/core/View","../FteMasterEntry","../views/FteMasterEntryDetailsPrintableView"],function(t,e,i,n,a,d,s,r){return d.extend({layoutName:"print",pageId:"fteMasterEntryDetailsPrintable",hdLeft:function(){var t=i.get(this.model.get("subdivision"));return e("fte","print:hdLeft",{subdivision:t?n(t,!1,!1):"?"})},hdRight:function(){return e("fte","print:hdRight",{date:t.format(this.model.get("date"),"YYYY-MM-DD"),shift:e("core","SHIFT:"+this.model.get("shift"))})},initialize:function(){this.model=a(new s({_id:this.options.modelId}),this),this.view=new r({model:this.model})},load:function(t){return t(this.model.fetch())}})});