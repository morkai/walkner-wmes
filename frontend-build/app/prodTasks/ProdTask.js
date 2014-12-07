// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){return e.extend({urlRoot:"/prodTasks",clientUrlRoot:"#prodTasks",topicPrefix:"prodTasks",privilegePrefix:"DICTIONARIES",nlsDomain:"prodTasks",labelAttribute:"name",defaults:{name:null,tags:null,fteDiv:!1,inProd:!0,clipColor:"#eeee00",parent:null},url:function(){var r=e.prototype.url.apply(this,arguments);return this.isNew()?r:r+"?populate(parent)"},parse:function(e){return Array.isArray(e.tags)||(e.tags=[]),e.clipColor||(e.clipColor="#eeee00"),e}})});