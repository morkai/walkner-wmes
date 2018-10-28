define(["underscore","jquery","app/i18n","app/core/View","app/core/util/idAndLabel","app/data/divisions","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/workCenters","app/data/prodLines"],function(e,r,i,t,n,o,l,s,d,a,c){"use strict";var p={DIVISION:1,SUBDIVISION:2,MRP_CONTROLLER:3,PROD_FLOW:4,WORK_CENTER:5,PROD_LINE:6},h={1:"division",2:"subdivision",3:"mrpController",4:"prodFlow",5:"workCenter",6:"prodLine"},u=function(){return!0};return t.extend({tagName:"div",className:"orgUnitDropdowns",afterRender:function(){0!==this.$el.children().length&&this.$el.empty(),!0!==this.options.noGrid&&this.$el.addClass("row");var e=this.options.orgUnit||p.DIVISION;e>=p.DIVISION&&this.renderDivisionDropdown(),e>=p.SUBDIVISION&&this.renderSubdivisionDropdown(),e>=p.MRP_CONTROLLER&&this.renderMrpControllerDropdown(),e>=p.PROD_FLOW&&this.renderProdFlowDropdown(),e>=p.WORK_CENTER&&this.renderWorkCenterDropdown(),e>=p.PROD_LINE&&this.renderProdLineDropdown()},focus:function(){return this.$id("division").select2("focus"),this},selectValue:function(e,r){var i=!r;switch(r||this.options.orgUnit){case p.DIVISION:this.selectDivision(e,i);break;case p.SUBDIVISION:this.selectSubdivision(e,i);break;case p.MRP_CONTROLLER:this.selectMrpController(e,i);break;case p.PROD_FLOW:this.selectProdFlow(e,i);break;case p.WORK_CENTER:this.selectWorkCenter(e,i);break;case p.PROD_LINE:this.selectProdLine(e,i)}return this},selectDivision:function(e,r){return this.selectModel(e,null,o,"division",r)},selectSubdivision:function(e,r){return this.selectModel(e,"selectDivision",l,"subdivision",r)},selectMrpController:function(e,r){return this.selectModel(e,"selectSubdivision",s,"mrpController",r)},selectProdFlow:function(e,r){return e?e.get("prodFlow")?this.selectModel(e,"selectMrpController",d,"prodFlow",r):e.get("mrpController")?((e=this.selectMrpController(e,r))&&this.$id("prodFlow").select2("val",null),e):null:null},selectWorkCenter:function(e,r){return this.selectModel(e,"selectProdFlow",a,"workCenter",r)},selectProdLine:function(){throw new Error("TODO")},selectModel:function(e,r,i,t,n){if(!e)return null;var o=e.get(t),l=i.get(Array.isArray(o)?o[0]:o);return null!==r&&(l=this[r](l,n)),l?(this.$id(t).select2("container").hasClass("select2-container-multi")||(o=l.id),this.$id(t).select2("val",o).trigger({type:"change",val:o,selectFirst:n}),e):null},createDropdownElement:function(e,t){var n=this.idPrefix+"-"+e,o=this.options,l=r('<div class="form-group"><label for="'+n+'" class="control-label">'+i("core","ORG_UNIT:"+e)+'</label><input id="'+n+'" name="'+e+'" type="text" autocomplete="new-password"></div>');return!0!==o.noGrid&&l.addClass("col-lg-"+Math.floor(12/o.orgUnit)),(!0===o.required||o.required&&o.required[e])&&(l.addClass("has-required-select2"),l.find("label").addClass("is-required"),l.find("input").addClass("is-required").prop("required",!0)),l.appendTo(this.el).find("input").select2({data:t||[],placeholder:" ",allowClear:o.allowClear||o.orgUnit===p.PROD_FLOW,multiple:o.multiple&&e===h[o.orgUnit]})},onChange:function(r,i,t,o){var l=[];null!==o.val&&(l=i.filter(function(r){var i=r.get(t);return Array.isArray(i)?Array.isArray(o.val)?e.intersection(i,o.val).length>0:-1!==i.indexOf(o.val):Array.isArray(o.val)?-1!==o.val.indexOf(i):i===o.val}).map(n));var s={data:l,placeholder:" ",allowClear:!!this.options.allowClear||"mrpController"===t&&this.options.orgUnit===p.PROD_FLOW,multiple:this.options.multiple&&r.attr("name")===h[this.options.orgUnit]};r.select2("val",null),r.select2(s),l.length&&!1!==o.selectFirst&&r.select2("val",l[0].id),r.trigger({type:"change",val:l.length?l[0].id:null})},renderDivisionDropdown:function(){this.createDropdownElement("division",o.filter(this.options.divisionFilter||u).map(n))},renderSubdivisionDropdown:function(){var e=this.createDropdownElement("subdivision");this.$id("division").on("change",this.onChange.bind(this,e,l,"division"))},renderMrpControllerDropdown:function(){var e=this.createDropdownElement("mrpController");this.$id("subdivision").on("change",this.onChange.bind(this,e,s,"subdivision"))},renderProdFlowDropdown:function(){var e=this.createDropdownElement("prodFlow");this.$id("mrpController").on("change",this.onChange.bind(this,e,d,"mrpController"))},renderWorkCenterDropdown:function(){var e=this.createDropdownElement("workCenter");this.$id("prodFlow").on("change",this.onChange.bind(this,e,a,"prodFlow"))},renderProdLineDropdown:function(){var e=this.createDropdownElement("prodLine");this.$id("workCenter").on("change",this.onChange.bind(this,e,c,"prodLine"))}},{ORG_UNIT:p})});