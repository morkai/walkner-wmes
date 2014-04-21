// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","../View","app/core/templates/error400","app/core/templates/error401","app/core/templates/error404"],function(e,r,t,o,a){return r.extend({layoutName:"page",pageId:"error",breadcrumbs:function(){return[e.bound("core","BREADCRUMBS:error",{code:this.options.code,codeStr:"e"+this.options.code})]},initialize:function(){var e;switch(this.options.code){case 401:e=o;break;case 404:e=a;break;default:e=t}this.view=new r({template:e})}})});