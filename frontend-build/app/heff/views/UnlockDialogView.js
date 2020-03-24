define(["underscore","app/core/View","app/data/localStorage","app/heff/templates/unlockDialog"],function(t,i,e,n){"use strict";return i.extend({template:n,dialogClassName:"production-modal",events:{submit:function(t){t.preventDefault();var i=this.$id("list").find(".active").text().trim(),n=this.$('input[name="station"]:checked').val();i&&n&&(this.$id("submit").prop("disabled",!0),e.setItem("HEFF:LINE",i),e.setItem("HEFF:STATION",n),setTimeout(function(){window.location.reload()},1))},"click #-list .btn":function(t){this.$id("list").find(".active").removeClass("active"),this.$(t.currentTarget).addClass("active")}},afterRender:function(){this.loadLines(),this.$('input[name="station"][value="'+(this.model.get("station")||6)+'"]').click()},selectActiveLine:function(){var t=this.$id("list").find(".active");t.length&&t[0].scrollIntoView({block:"center"})},onDialogShown:function(){this.selectActiveLine()},loadLines:function(){var i=this;i.$id("submit").prop("disabled",!0);var e=i.ajax({url:"/production/getActiveLines?subdivisionType=assembly"});e.fail(function(){i.$(".fa-spin").removeClass("fa-spin")}),e.done(function(e){var n="";t.forEach(e.collection,function(e){var a=t.escape(e._id),s="btn btn-lg btn-default";e._id===i.model.get("prodLine")&&(s+=" active"),n+='<button type="button" class="'+s+'">'+a+"</button>"}),i.$id("list").html(n),i.$id("submit").prop("disabled",!1),i.selectActiveLine()})}})});