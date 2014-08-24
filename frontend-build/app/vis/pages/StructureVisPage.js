// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/core/View","../views/StructureVisView"],function(e,n,r,i){return r.extend({layoutName:"page",breadcrumbs:[n.bound("vis","BREADCRUMBS:structure")],initialize:function(){this.view=new i},destroy:function(){document.body.classList.remove("no-overflow")},afterRender:function(){document.body.classList.add("no-overflow")},load:function(n){if("undefined"!=typeof window.d3)return n();var r=e.Deferred();return require(["d3"],function(){r.resolve()}),n(r)}})});