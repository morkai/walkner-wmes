define(["underscore","jquery","app/core/views/FormView","app/mrpControllers/util/setUpMrpSelect2","app/planning-orderGroups/templates/form"],function(e,t,r,i,n){"use strict";return r.extend({template:n,serializeToForm:function(){var e=this.model.toJSON();return e.mrp=(e.mrp||[]).join(","),["productInclude","productExclude","bomInclude","bomExclude"].forEach(t=>{e[t]=(e[t]||[]).map(e=>e.join("; ")).join("\n")}),e},serializeForm:function(t){return t.description||(t.description=""),t.mrp=(t.mrp||"").split(",").filter(function(e){return!!e}),["productInclude","productExclude","bomInclude","bomExclude"].forEach(function(r){t[r]=e.uniq((t[r]||"").split("\n")).map(t=>e.uniq(t.split(/; */).map(e=>e.trim().replace(/\s+/g," ").toUpperCase()).filter(e=>e.length>0))).filter(e=>e.length>0)}),t.target||(t.target=[]),t},afterRender:function(){r.prototype.afterRender.apply(this,arguments),i(this.$id("mrp"),{width:"100%"}),"000000000000000000000000"===this.model.id&&(this.$id("mrp").select2("enable",!1),this.$("textarea.text-mono").prop("disabled",!0))}})});