define(["app/i18n","../util/bindLoadingMessage","../util/pageActions","../View","../views/ListView"],function(e,t,i,n,o){return n.extend({layoutName:"page",pageId:"list",breadcrumbs:function(){return[e.bound(this.collection.getNlsDomain(),"BREADCRUMBS:browse")]},actions:function(){return[i.add(this.collection,this.collection.getPrivilegePrefix()+":MANAGE")]},initialize:function(){this.collection=t(this.options.collection,this);var e=this.options.ListView||o;this.view=new e({collection:this.collection,columns:this.options.columns||e.prototype.columns,serializeRow:this.options.serializeRow||e.prototype.serializeRow})},load:function(e){return e(this.collection.fetch({reset:!0}))}})});