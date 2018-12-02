define(["jquery","app/broker","app/user","app/core/View","../Entry","./AddFormView","app/wmes-fap-entries/templates/navbar"],function(e,n,i,t,r,d,a){"use strict";return t.extend({template:a,events:{"click #-add":function(){var e=this;if(e.$(".fap-addForm").length)return e.removeView("#-addForm"),e.toggleAddForm(!1),void(e.timers.resetNewEntry=setTimeout(function(){e.newEntry=null},3e5));clearTimeout(e.timers.resetNewEntry),e.timers.resetNewEntry=null,e.toggleAddForm(!0),e.newEntry||(e.newEntry=new r,e.listenTo(e.newEntry,"sync",function(){e.newEntry=new r,e.hideAddForm()}));var n=new d({model:e.newEntry});e.listenTo(n,"cancel",e.hideAddForm),e.setView("#-addForm",n).render()}},initialize:function(){e(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){e(window).off("."+this.idPrefix)},afterRender:function(){this.$(".fap-addForm").length&&this.toggleAddForm(!0)},toggleAddForm:function(e){var n=this.$id("add").find(".fa");this.$el.toggleClass("fap-navbar-adding",e),this.$id("menu").prop("disabled",e),e?n.removeClass("fa-plus").addClass("fa-times"):n.removeClass("fa-times").addClass("fa-plus")},hideAddForm:function(){this.$(".fap-addForm").length&&this.$id("add").click()},onKeyDown:function(e){"Escape"===e.originalEvent.key&&this.hideAddForm()}},{setUp:function(){if(!window.MODULES||-1!==window.MODULES.indexOf("wmes-fap")){var e=this;n.subscribe("navbar.rendered",function(n){var i=n.view;if(!i.$el.find(".fap-navbar").length){var t=new e;i.insertView(".navbar-collapse",t).render()}})}}})});