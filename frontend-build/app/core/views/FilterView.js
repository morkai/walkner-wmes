// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","js2form","h5.rql/specialTerms","app/i18n","app/core/View","app/core/util","app/core/util/buttonGroup","app/core/templates/filterLimit","select2"],function(e,t,i,r,l,s,a,n,o){"use strict";return s.extend({minLimit:5,maxLimit:100,termToForm:{},defaultFormData:{},formData:null,events:{submit:function(){return this.changeFilter(),!1},"click .filter-toggle":"toggle"},collapsed:!1,serialize:function(){var e=this;return{idPrefix:this.idPrefix,renderLimit:function(){return o({idPrefix:e.idPrefix,min:e.minLimit,max:e.maxLimit})}}},toggleButtonGroup:function(e){return n.toggle(this.$id(e))},getButtonGroupValue:function(e){return n.getValue(this.$id(e))},afterRender:function(){this.formData=this.serializeQueryToForm(),i(this.el,this.formData),this.$toggleFilter=t('<button class="btn btn-default btn-block filter-toggle" type="button"></button>').append('<i class="fa"></i>').append("<span></span>"),this.$el.append(this.$toggleFilter),this.toggle()},toggle:function(){window.innerWidth<768&&(this.collapsed=!this.collapsed,this.$el.toggleClass("is-collapsed",this.collapsed).toggleClass("is-expanded",!this.collapsed)),this.$toggleFilter.find("span").text(l("core","filter:"+(this.collapsed?"show":"hide"))),this.$toggleFilter.find(".fa").removeClass("fa-caret-up fa-caret-down").addClass("fa-caret-"+(this.collapsed?"down":"up"))},serializeQueryToForm:function(){var t=this.model.rqlQuery,i=e.extend({},e.result(this,"defaultFormData"),{limit:t.limit<5?5:t.limit>100?100:t.limit});return t.selector.args.forEach(function(e){r[e.name]||this.serializeTermToForm(e,i)},this),i},serializeTermToForm:function(e,t){var i="string"==typeof e.args[0]?e.args[0]:null,r=this.termToForm[i];r&&("string"==typeof r&&(r=this.termToForm[r]),"function"==typeof r&&r.call(this,i,e,t))},isValid:function(){return!0},changeFilter:function(){if(this.isValid()){var e=this.model.rqlQuery,t=[],i=this.$id("limit");this.copyPopulateTerms(t),this.serializeFormToQuery(t,e),e.selector={name:"and",args:t},e.skip=0,i.length&&(e.limit=Math.min(Math.max(parseInt(this.$id("limit").val(),10)||15,this.minLimit),this.maxLimit)),this.trigger("filterChanged",e)}},copyPopulateTerms:function(e){this.model.rqlQuery.selector.args.forEach(function(t){"populate"===t.name&&e.push(t)})},serializeFormToQuery:function(e,t){},serializeRegexTerm:function(e,t,i,r,l,s){var n=this.$id(t.replace(/\./g,"-")),o=n.val().trim();"-"!==o&&null!==r&&(o=o.replace(void 0===r?/[^0-9]/g:r,"")),n.val(o),"-"===o&&(o=null);var u=[t,o];return null===o||!l&&o.length===i?void e.push({name:"eq",args:u}):void(0!==o.length&&(l&&u.push("i"),u[1]=a.escapeRegExp(u[1]),o.length===i?u[1]="^"+u[1]+"$":s&&(u[1]="^"+u[1]),e.push({name:"regex",args:u})))},unescapeRegExp:function(e){return a.unescapeRegExp(e,!0)}})});