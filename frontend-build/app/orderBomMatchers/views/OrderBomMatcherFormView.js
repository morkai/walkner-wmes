define(["underscore","app/core/views/FormView","app/core/util/idAndLabel","app/data/orgUnits","app/orderBomMatchers/templates/form","app/orderBomMatchers/templates/_componentRow"],function(t,n,e,i,r,o){"use strict";return n.extend({template:r,events:t.assign({"blur #-matchers-mrp":function(t){t.target.value=t.target.value.trim().toUpperCase().split(/[^A-Z0-9]/).filter(function(t){return t.length>0}).join(", ")},"blur #-matchers-nc12":function(t){t.target.value=t.target.value.trim().toUpperCase().split(/[^A-Z0-9]/).filter(function(t){return t.length>0}).join(", ")},"blur #-matchers-name":function(t){var n=!1;t.target.value=t.target.value.trim().split("\n").filter(function(t){return t.length>0}).map(function(t){try{return new RegExp(t,"i"),t}catch(e){return n=!0,t+" <-- "+e.message}}).join("\n"),t.target.setCustomValidity(n?this.t("FORM:ERROR:pattern"):"")},'blur input[name$="nc12Index"]':"validateReIndexes",'blur input[name$="snIndex"]':"validateReIndexes",'blur input[name$="attern"]':function(t){try{new RegExp(t.target.value),t.target.setCustomValidity("")}catch(n){t.target.setCustomValidity(n.message)}},'focus input[name$="pattern"]':function(t){var n=this.$(t.target);n.parent().css({position:"relative"}),n.css({position:"absolute",width:"878px",top:"5px",left:"5px"}),n.one("blur",function(){n.css({position:"",width:""}).parent().css({position:""})})},'click .btn[data-action="removeComponent"]':function(t){this.$(t.currentTarget).closest("tr").remove(),this.recountComponents()},"click #-addComponent":function(){this.addComponent({pattern:"",description:"",missing:!1,unique:!1,single:!0,nc12Index:[],snIndex:[],labelPattern:""}),this.recountComponents(),this.$id("components").children().last().find("input").first().focus()}},n.prototype.events),initialize:function(){n.prototype.initialize.apply(this,arguments),this.nextComponentI=0},afterRender:function(){n.prototype.afterRender.apply(this,arguments),this.$id("matchers-line").select2({width:"100%",allowClear:!0,multiple:!0,placeholder:" ",data:i.getActiveByType("prodLine").map(e)});var r=this.model.get("components");t.isEmpty(r)?(this.$id("addComponent").click(),this.$id("description").focus()):(r.forEach(this.addComponent,this),this.recountComponents())},serializeToForm:function(){var n=this.model.toJSON();return n.matchers=t.assign({line:[],mrp:[],nc12:[],name:[]},n.matchers),n.matchers={line:n.matchers.line.join(","),mrp:n.matchers.mrp.join(", "),nc12:n.matchers.nc12.join(", "),name:n.matchers.name.join("\n")},n.components=void 0,n},serializeForm:function(n){return n.matchers=t.assign({line:"",mrp:"",nc12:"",name:""},n.matchers),n.matchers={line:n.matchers.line.split(",").filter(function(t){return t.length>0}),mrp:n.matchers.mrp.split(", ").filter(function(t){return t.length>0}),nc12:n.matchers.nc12.split(", ").filter(function(t){return t.length>0}),name:n.matchers.name.split("\n").filter(function(t){return t.length>0})},n.components=(n.components||[]).map(function(t){return t.pattern||(t.pattern=""),t.nc12Index=(t.nc12Index||"").split(", ").map(function(t){return+t}).filter(function(t){return t>=-1}),t.snIndex=(t.snIndex||"").split(", ").map(function(t){return+t}).filter(function(t){return t>=-1}),0===t.nc12Index.length&&t.nc12Index.push(-1),0===t.snIndex.length&&t.snIndex.push(-1),t}),n},validateReIndexes:function(t){t.target.value=t.target.value.split(/[^0-9\-]/).filter(function(t){return!isNaN(parseInt(t,10))}).join(", ")},addComponent:function(t){this.$id("components").append(this.renderPartial(o,{i:this.nextComponentI++,component:t}))},recountComponents:function(){var t=this.$id("components").children();t.length?t.each(function(t){this.children[0].textContent=t+1+"."}):this.$id("addComponent").click()}})});