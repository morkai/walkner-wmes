define(["underscore","jquery","form2js","select2","app/i18n","app/time","app/viewport","app/data/orgUnits","app/core/views/FilterView","app/core/util/idAndLabel","app/reports/Report8Query","app/reports/templates/8/filter"],function(e,t,i,n,r,s,o,a,d,l,p,u){"use strict";return d.extend({template:u,events:e.extend({"change #-from":"setUpProdLineSelect2","change #-to":"setUpProdLineSelect2",'change [name="divisions[]"]':"setUpProdLineSelect2",'change [name="subdivisionTypes[]"]':"setUpProdLineSelect2"},d.prototype.events),initialize:function(){d.prototype.initialize.apply(this,arguments);var e={};a.getAllByType("prodLine").forEach(function(t){var i=a.getAllForProdLine(t);e[i.subdivision]||(e[i.subdivision]=[]);var n=t.get("deactivatedAt");e[i.subdivision].push({id:t.id,text:t.get("description"),deactivatedAt:n?Date.parse(n):0})}),this.subdivisionToProdLines=e},serialize:function(){return e.extend(d.prototype.serialize.call(this),{numericProps:p.NUMERIC_PROPS,divisions:a.getAllByType("division").filter(function(e){return"prod"===e.get("type")}).map(l)})},afterRender:function(){d.prototype.afterRender.call(this),this.setUpProdLineSelect2()},setUpProdLineSelect2:function(){var i=this.serializeTimeRange(),r=this.getCheckboxValues('[name="divisions[]"]:checked'),s=this.getCheckboxValues('[name="subdivisionTypes[]"]:checked');r.length||(r=this.getCheckboxValues('[name="divisions[]"]')),s.length||(s=this.getCheckboxValues('[name="subdivisionTypes[]"]'));var o=this.subdivisionToProdLines,d=[],l={};e.forEach(r,function(t){var n=a.getByTypeAndId("division",t),r=a.getChildren(n).filter(function(t){return e.includes(s,t.get("type"))});e.forEach(r,function(t){var r={text:n.id+" \\ "+t.getLabel(),children:[]};e.forEach(o[t.id],function(e){(!e.deactivatedAt||e.deactivatedAt>=i.from)&&(r.children.push(e),l[e.id]=!0)}),r.children.length&&d.push(r)})});var p=t().select2.defaults.matcher,u=this.$id("prodLines");u.val(u.val().split(",").filter(function(e){return l[e]})),u.select2({width:322,multiple:!0,data:1===d.length?d[0].children:d,dropdownCssClass:"reports-8-prodLines-select2",matcher:function(e,t,i){return p(e,i.id)||p(e,t)},formatResult:function(e,t,i,r){if(!e.id)return r(e.text);var s=[];return n.util.markMatch(e.id,i.term,s,r),s.push(": "),s.push('<span style="text-decoration: '+(e.deactivatedAt?"line-through":"initial")+'">'),n.util.markMatch(e.text,i.term,s,r),s.push("</span>"),s.join("")},formatSelection:function(e){return e.deactivatedAt?'<span style="text-decoration: line-through">'+e.id+"</span>":e.id}})},getCheckboxValues:function(e){return this.$(e).get().map(function(e){return e.value})},serializeQueryToForm:function(){var t=this.model.toJSON();return t.from=s.format(t.from,"YYYY-MM-DD"),t.to=s.format(t.to,"YYYY-MM-DD"),["days","shifts","divisions","subdivisionTypes"].forEach(this.applyAllOptionsIfEmpty.bind(this,t)),t.prodLines=e.isArray(t.prodLines)?t.prodLines.join(","):"",t},applyAllOptionsIfEmpty:function(t,i){e.isEmpty(t[i])&&(t[i]=this.$('input[name="'+i+'[]"]').map(function(){return this.value}).get())},changeFilter:function(){this.model.set(this.serializeFormToQuery(),{reset:!0})},serializeFormToQuery:function(){var t=e.extend(e.result(this.model,"defaults"),i(this.el),{_rnd:Math.random()});return e.extend(t,this.serializeTimeRange(t)),this.$id("from").val(s.format(t.from,"YYYY-MM-DD")),this.$id("to").val(s.format(t.to,"YYYY-MM-DD")),["days","shifts","divisions","subdivisionTypes"].forEach(this.applyAllOptionsIfEmpty.bind(this,t)),t.prodLines.length&&(t.prodLines=t.prodLines.split(",")),delete t.visibleSeries,t},serializeTimeRange:function(e){e||(e={from:this.$id("from").val(),to:this.$id("to").val(),interval:this.$('[name="interval"]:checked').val()});var t=s.getMoment(e.from,"YYYY-MM-DD").startOf(e.interval).valueOf(),i=s.getMoment(e.to,"YYYY-MM-DD").startOf(e.interval);return t===i.valueOf()&&i.add(1,e.interval),{from:t,to:i.valueOf()}}})});