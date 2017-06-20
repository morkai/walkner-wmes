// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","../util/bindLoadingMessage","../util/pageActions","../View","../views/ListView","./createPageBreadcrumbs"],function(i,e,t,s,o,n){"use strict";return s.extend({layoutName:"page",pageId:"list",baseBreadcrumb:!1,breadcrumbs:function(){return n(this)},actions:function(){return[t.add(this.collection,this.collection.getPrivilegePrefix()+":MANAGE")]},initialize:function(){this.collection=e(this.options.collection,this);var i=this.ListView||o;this.view=new i({collection:this.collection,columns:this.options.columns||i.prototype.columns,serializeRow:this.options.serializeRow||i.prototype.serializeRow,className:this.options.listClassName||i.prototype.className||"is-clickable"})},load:function(i){return i(this.collection.fetch({reset:!0}))}})});