define(["js2form","app/core/View","app/qiResults/QiOutgoingQualityReport","app/qiResults/templates/outgoingQuality/filter"],function(e,t,i,r){"use strict";return t.extend({template:r,events:{submit:function(){return this.changeFilter(),!1}},afterRender:function(){e(this.el,this.serializeFormData())},serializeFormData:function(){return{week:this.model.get("week")}},changeFilter:function(){var e={week:i.parseWeek(this.$id("week").val())};this.$id("week").val(e.week),this.model.set(e),this.model.trigger("filtered")}})});