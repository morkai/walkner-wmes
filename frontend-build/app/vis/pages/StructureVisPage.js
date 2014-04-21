// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/core/View","../views/StructureVisView"],function(e,i,r,n){return r.extend({layoutName:"page",pageId:"structureVis",breadcrumbs:[i.bound("vis","BREADCRUMBS:structure")],initialize:function(){this.view=new n},load:function(i){if("undefined"!=typeof window.d3)return i();var r=e.Deferred();return require(["d3"],function(){r.resolve()}),i(r)}})});