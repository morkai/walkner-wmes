// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../core/Collection","../data/orgUnits","./ProdLineState"],function(e,r,n,t){return r.extend({model:t,parse:function(e){for(var r=[],n=0,i=e.prodLineStates.length;i>n;++n)r.push(t.parse(e.prodLineStates[n]));return r},getForDivision:function(r){var t={},i=this;return this.forEachProdLine(n.getByTypeAndId("division",r),function(e){var r=i.get(e.id);r&&!t[e.id]&&(t[e.id]=r)}),e.values(t)},forEachProdLine:function(e,r){var t=n.getChildren(e),i=0,o=t.length;if("workCenter"===n.getType(e))for(;o>i;++i)r(t[i]);else for(;o>i;++i)this.forEachProdLine(t[i],r)}})});