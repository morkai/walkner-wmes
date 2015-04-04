// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","underscore","js2form","app/core/View","app/data/aors","app/data/downtimeReasons","app/reports/templates/report1DisplayOptions","app/core/util/ExpandableSelect"],function(e,t,s,n,i,r,a){"use strict";return n.extend({template:a,events:{"submit form":function(e){e.preventDefault()},"change #-series":function(e){this.updateSelection("series",e.target)},"change #-references":function(e){this.updateSelection("references",e.target,!0)},"change #-aors":function(e){this.updateSelection("aors",e.target)},"change #-reasons":function(e){this.updateSelection("reasons",e.target)},"change [name=extremes]":function(){this.model.set("extremes",this.$("[name=extremes]:checked").val())},"click #-showFilter":function(){this.trigger("showFilter")}},destroy:function(){this.$(".is-expandable").expandableSelect("destroy")},serialize:function(){return{idPrefix:this.idPrefix,aors:i.map(function(e){return{id:e.id,label:e.getLabel()}}),reasons:r.map(function(e){return{id:e.id,label:e.id+": "+e.getLabel()}})}},beforeRender:function(){this.$(".is-expandable").expandableSelect("destroy")},afterRender:function(){s(this.el.querySelector("form"),this.serializeFormData()),this.$(".is-expandable").expandableSelect(),this.$("[name=extremes]:checked").closest(".btn").addClass("active")},serializeFormData:function(){return{series:Object.keys(this.model.get("series")),extremes:this.model.get("extremes"),references:Object.keys(this.model.get("references")),aors:Object.keys(this.model.get("aors")),reasons:Object.keys(this.model.get("reasons"))}},updateSelection:function(e,t,s){var n,i,r={};if(0===t.selectedOptions.length&&s!==!0)for(n=0,i=t.length;i>n;++n)t[n].selected=!0;for(n=0,i=t.length;i>n;++n)r[t[n].value]=t[n].selected;this.model.set(e,r)},shown:function(){this.$id("series").focus()}})});