define(["app/core/views/FormView","app/wmes-dummyPaint-families/templates/form"],function(e,t){"use strict";return e.extend({template:t,events:Object.assign({"input #-_id":function(){this.scheduleIdCheck()}},e.prototype.events),scheduleIdCheck:function(){this.options.editMode||(this.$id("duplicateKey").addClass("hidden"),this.checkReq&&(this.checkReq.abort(),this.checkReq=null),clearTimeout(this.timers.checkId),this.timers.checkId=setTimeout(this.checkId.bind(this),250),this.$(".btn-primary").prop("disabled",!0))},checkId:function(){var e=this,t=e.$id("_id").val().trim(),i=e.checkReq=e.ajax({method:"HEAD",url:"/dummyPaint/families/"+encodeURIComponent(t)});i.fail(function(){e.$id("duplicateKey").addClass("hidden")}),i.done(function(){e.$id("duplicateKey").attr("href","#dummyPaint/families/"+encodeURIComponent(t)+";edit").removeClass("hidden")}),i.always(function(){e.$(".btn-primary").prop("disabled",!1)})},getFailureText:function(t){return t.responseJSON&&t.responseJSON.error&&"DUPLICATE_KEY"===t.responseJSON.error.code?this.t("FORM:ERROR:duplicateKey"):e.prototype.getFailureText.apply(this,arguments)}})});