define(["app/i18n","../View","app/core/templates/error400","app/core/templates/error401","app/core/templates/error404"],function(e,t,i,n,o){return t.extend({layoutName:"page",pageId:"error",breadcrumbs:function(){return[e.bound("core","BREADCRUMBS:error",{code:this.options.code,codeStr:"e"+this.options.code})]},initialize:function(){var e;switch(this.options.code){case 401:e=n;break;case 404:e=o;break;default:e=i}this.view=new t({template:e})}})});