define(["app/core/views/FormView","app/prodTasks/templates/form"],function(e,t){return e.extend({template:t,afterRender:function(){e.prototype.afterRender.call(this),this.$id("tags").select2({tags:this.model.allTags||[],tokenSeparators:[","]})},serializeToForm:function(){var e=this.model.toJSON();return e.tags=e.tags?e.tags.join(","):"",e},serializeForm:function(e){return e.tags="string"==typeof e.tags?e.tags.split(","):[],e}})});