// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/View","../FteMasterEntry","../views/FteEntryAddFormView"],function(e,t,i,r){return t.extend({layoutName:"page",pageId:"fteMasterEntryAddForm",breadcrumbs:[{label:e.bound("fte","BREADCRUMBS:master:browse"),href:"#fte/master"},e.bound("fte","BREADCRUMBS:addForm")],initialize:function(){this.view=new r({model:new i,divisionFilter:function(e){return e&&"prod"===e.get("type")}}),this.listenTo(this.view,"editable",function(e){this.broker.publish("router.navigate",{url:e.genClientUrl("edit"),trigger:!0})}),this.listenTo(this.view,"uneditable",function(e){this.broker.publish("router.navigate",{url:e.genClientUrl(),trigger:!0})})}})});