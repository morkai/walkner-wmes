define(["underscore","jquery","app/viewport","app/core/views/FormView","app/wmes-trw-bases/templates/clusterForm"],function(e,t,i,s,a){"use strict";return s.extend({template:a,events:e.assign({"click #-image-preview":function(){this.$id("image-upload").click()},"change #-image-upload":function(e){e.target.files.length&&this.uploadImage(e.target.files[0])},"click #-image-clear":function(){this.$id("image-preview").prop("src","")}},s.prototype.events),initialize:function(){s.prototype.initialize.apply(this,arguments),t(window).on("paste."+this.idPrefix,this.onPaste.bind(this))},afterRender:function(){s.prototype.afterRender.apply(this,arguments),this.model.id&&this.$id("id").prop("disabled",!0)},onDialogShown:function(){this.model.id?this.$id("label-text").focus():this.$id("id").focus()},serializeToForm:function(){var e=this.model.toJSON();return e.cols=e.rows.length?e.rows[0].length:1,e.rows=e.rows.length||1,e},serializeForm:function(e){return e.label.text||(e.label.text=""),e.top=parseInt(e.top,10)||0,e.left=parseInt(e.left,10)||0,e.rows=parseInt(e.rows,10)||1,e.cols=parseInt(e.cols,10)||1,e},submitRequest:function(e,t){for(var s=this.model.get("rows"),a=[],o=0;o<t.rows;++o){for(var r=s[o]||[],n=[],l=0;l<t.cols;++l)n.push(r[l]||{label:(o+1+l*t.rows).toString(),io:[],endpoints:[]});a.push(n)}delete t.cols,t.rows=a,t.image=this.$id("image-preview").prop("src"),/^data:image/.test(t.image)||(t.image=""),this.model.set(t),i.closeDialog()},onPaste:function(e){var t=e.originalEvent.clipboardData;t&&t.files&&t.files.length&&this.uploadImage(t.files[0])},uploadImage:function(e){if(/^image/.test(e.type)){var t=this.$id("image-preview"),i=this.$id("submit").prop("disabled",!0),s=new FileReader;s.onload=function(e){t.prop("src",e.target.result)},s.readAsDataURL(e);var a=new FormData;a.append("image",e);var o=this.ajax({type:"POST",url:"/trw/bases;prepare-image",data:a,processData:!1,contentType:!1});o.fail(function(){"abort"!==o.statusText&&t.prop("src","")}),o.done(function(e){t.prop("src",e.src)}),o.always(function(){i.prop("disabled",!1)})}}})});