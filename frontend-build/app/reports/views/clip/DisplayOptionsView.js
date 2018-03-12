// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","underscore","js2form","app/core/View","app/reports/templates/clip/displayOptions","app/core/util/ExpandableSelect"],function(e,t,s,i,n){"use strict";return i.extend({template:n,events:{"submit form":function(e){e.preventDefault()},"change #-series":function(e){this.updateSelection("series",e.target)},"change [name=extremes]":function(){this.model.set("extremes",this.$("[name=extremes]:checked").val())},"click #-showFilter":function(){this.trigger("showFilter")}},destroy:function(){this.$(".is-expandable").expandableSelect("destroy")},beforeRender:function(){this.$(".is-expandable").expandableSelect("destroy")},afterRender:function(){s(this.el.querySelector("form"),this.serializeFormData()),this.$(".is-expandable").expandableSelect(),this.$("[name=extremes]:checked").closest(".btn").addClass("active")},serializeFormData:function(){return{series:Object.keys(this.model.get("series")),extremes:this.model.get("extremes")}},updateSelection:function(e,t,s){var i,n,r={};if(0===t.selectedOptions.length&&s!==!0)for(i=0,n=t.length;i<n;++i)t[i].selected=!0;for(i=0,n=t.length;i<n;++i)r[t[i].value]=t[i].selected;this.model.set(e,r)},shown:function(){this.$id("series").focus()}})});