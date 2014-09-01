// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","d3","screenfull","app/viewport","app/core/View","app/factoryLayout/templates/list","./ProdLineStateListItemView"],function(e,i,t,n,s,o,r,d){return o.extend({template:r,initialize:function(){this.onKeyDown=this.onKeyDown.bind(this),this.onResize=e.debounce(this.onResize.bind(this),16),this.lastWidth=null,i("body").on("keydown",this.onKeyDown),i(window).on("resize",this.onResize),n.onchange=e.debounce(this.onFullscreen.bind(this),16)},destroy:function(){i("body").off("keydown",this.onKeyDown),i(window).off("resize",this.onResize),n.onchange=function(){}},beforeRender:function(){this.stopListening(this.model.prodLineStates,"reset",this.render)},afterRender:function(){this.listenToOnce(this.model.prodLineStates,"reset",this.render),this.getProdLineStates().forEach(this.renderProdLineState,this)},getProdLineStates:function(){if(this.listOptions.hasDivision())return this.model.prodLineStates.getForDivision(this.listOptions.get("division"));var e=[],i=this.listOptions.get("prodLines");if(Array.isArray(i))for(var t=0,n=i.length;n>t;++t){var s=this.model.prodLineStates.get(i[t]);s&&e.push(s)}return e},renderProdLineState:function(e){this.insertView(new d({model:e,keep:!1})).render()},onKeyDown:function(e){122!==e.which||n.isFullscreen||(e.preventDefault(),n.request(this.el.parentNode))},onResize:function(){window.innerWidth!==this.lastWidth&&(this.lastWidth=window.innerWidth,this.getViews().each(function(e){e.resize()}))},onFullscreen:function(){}})});