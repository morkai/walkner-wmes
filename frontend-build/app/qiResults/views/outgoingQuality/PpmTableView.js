define(["underscore","jquery","app/viewport","app/core/View","app/reports/util/formatXAxis","app/qiResults/templates/outgoingQuality/ppmTable"],function(e,t,n,i,a,r){"use strict";return i.extend({template:r,events:{"click td[data-key]":function(e){var i=this,a=e.currentTarget,r=a.dataset.key,o=parseInt(a.textContent.trim(),10)||0;if(!a.querySelector(".fa-spinner")){var s=a.querySelector("input");if(s)s.focus();else{i.$("form").remove();var u=t("<form></form>"),l=t('<input type="number" class="form-control" min="0">').val(o),f=t('<button class="btn btn-primary"><i class="fa fa-save"></i></button>');u.append(l).append(f).on("submit",function(){var e=parseInt(l.val(),10)||0;if(u.remove(),e!==o){n.msg.saving(),a.style.textAlign="center",a.innerHTML='<i class="fa fa-spinner fa-spin"></i>';var t=i.ajax({method:"POST",url:"/qi/reports/outgoingQuality/weeks/"+r,data:JSON.stringify({target:e})});return t.fail(function(){n.msg.savingFailed(),a.innerHTML=o}),t.done(function(){n.msg.saved()}),t.always(function(){a.style.textAlign=""}),!1}}),u.appendTo(a),l.focus()}}}},initialize:function(){this.listenTo(this.model,"change:groups",this.render),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},getTemplateData:function(){var t=this;return{canManage:t.model.canManage(),data:e.map(t.model.get("groups"),function(e){return{key:e.key,week:a(t,{value:e.key}),oql:e.oql,target:e.oqlTarget}})}},onKeyDown:function(e){"Escape"===e.key&&this.$("form").remove()}})});