define(["app/core/View","app/wh/templates/pickup/forceLine"],function(t,i){"use strict";return t.extend({template:i,nlsDomain:"wh",events:{submit:function(){var t=this.$(".active[data-line]");return!(!t.length||t.hasClass("hidden"))&&(this.trigger("picked",{line:t[0].dataset.line,card:this.$id("card").val().trim()}),!1)},"click .btn[data-line]":function(t){this.$(".active[data-line]").removeClass("active"),t.currentTarget.classList.add("active")},"input #-filter":function(){var t=this.transliterate(this.$id("filter").val().trim());this.$(".btn[data-line]").each(function(){this.classList.toggle("hidden",-1===this.dataset.filter.indexOf(t))})}},getTemplateData:function(){return{card:this.model.personnelId,lines:this.serializeLines()}},serializeLines:function(){var t=this;return t.model.whLines.map(function(i){return{_id:i.id,filter:t.transliterate(i.id)}})},afterRender:function(){this.$(".btn[data-filter]").first().click()},onDialogShown:function(){var t=this.$(".active[data-filter]");t.length&&t[0].scrollIntoView()},transliterate:function(t){return t.toUpperCase().replace(/[^A-Z0-9]+/g,"")},getCard:function(){return this.$id("card").val().trim()},setCard:function(t){this.getCard()===t?this.$id("submit").click():this.$id("card").val(t)}})});