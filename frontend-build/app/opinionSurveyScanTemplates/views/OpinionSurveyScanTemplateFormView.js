// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","underscore","dragscroll","interact","app/i18n","app/viewport","app/core/views/FormView","app/core/util/idAndLabel","../util/getRegionLabel","./ImageEditFormView","./RegionEditFormView","app/opinionSurveyScanTemplates/templates/form","app/opinionSurveyScanTemplates/templates/region"],function(t,e,i,n,o,s,a,r,l,d,h,u,c){"use strict";var g=o.forDomain("opinionSurveyScanTemplates");return a.extend({template:u,events:e.extend({"dblclick .is-selected":function(t){this.editRegion(t.currentTarget)},"mousedown #-image":function(t){0===t.button&&t.preventDefault()},"mousedown #-overlay":function(t){0===t.button&&this.onOverlayDown(t)},"mouseup #-overlay":function(t){0===t.button&&this.onOverlayUp(t)},"mousemove #-overlay":function(t){this.onOverlayMove(t)},"click .btn[data-action]":function(t){this.toggleAction(t.currentTarget.dataset.action)}},a.prototype.events),initialize:function(){a.prototype.initialize.apply(this,arguments),this.onKeyDown=this.onKeyDown.bind(this),this.onScrollLimited=e.debounce(this.onScroll.bind(this),1e3/60),this.action=null,this.zIndex=0,this.drawing={enabled:!1,started:!1,finished:!0,mode:null,$el:null,startX:0,startY:0,value:null},t(window).on("scroll."+this.idPrefix,this.onScrollLimited),t(document.body).on("keydown."+this.idPrefix,this.onKeyDown)},destroy:function(){t(window).off("."+this.idPrefix),t(document.body).off("."+this.idPrefix),this.regionInteract&&this.regionInteract.unset(),i.destroy()},serialize:function(){var t=this.model,i=t.getSurveyId(),n={id:"",src:"/app/opinionSurveyScanTemplates/assets/empty.png",width:"1280",height:""},o=[];return t.get("image")&&(n.id=t.get("image"),n.src="/opinionSurveys/scanTemplates/"+n.id+".jpg",n.width=t.get("width"),n.height=t.get("height")),(this.model.get("regions")||[]).forEach(function(t){o.push({label:this.getRegionLabel(t.question,i),region:t})},this),e.extend(a.prototype.serialize.call(this),{image:n,regions:o,renderRegion:c})},afterRender:function(){a.prototype.afterRender.call(this),this.setUpSurveySelect2(),this.setUpToolbarErrorFields(),this.setUpImageDragScroll(),this.setUpRegionInteract(),this.toggleNoImageError(),this.toggleNoRegionsError(),this.onScroll()},setUpToolbarErrorFields:function(){var t=this;this.$(".opinionSurveyScanTemplates-toolbar-error").each(function(){var e=this.previousElementSibling;if(e){var i=parseInt(e.style.width,10),n=parseInt(e.style.left,10);this.style.left+=i+n+7+"px"}else this.style.left="7px";this.style.width=t.$('.btn[data-action="'+this.dataset.action+'"]').outerWidth()+"px"})},setUpSurveySelect2:function(){this.$id("survey").select2({minimumResultsForSearch:5,data:this.model.surveys.map(r)})},setUpImageDragScroll:function(){i.reset({stopPropagation:!1,accept:function(t){return"IMG"===t.target.tagName}})},setUpRegionInteract:function(){var t=this;this.regionInteract=n(".opinionSurveyScanTemplates-region").draggable({restrict:{restriction:"parent",endOnly:!1,elementRect:{top:0,left:0,bottom:1,right:1}},onstart:function(){},onend:function(e){t.selectRegion(e.target)},onmove:function(t){var e=t.target,i=parseFloat(e.style.left)+t.dx,n=parseFloat(e.style.top)+t.dy;e.style.left=i+"px",e.style.top=n+"px"}}).resizable({edges:{top:!1,left:!1,right:!0,bottom:!0},onend:function(e){t.selectRegion(e.target)},onmove:function(t){var e=t.target,i=t.rect;i.width<40||i.height<40||(e.style.width=i.width+"px",e.style.height=i.height+"px")}}).on("move",function(t){t.currentTarget.style.cursor=document.documentElement.style.cursor}).on("down",function(e){t.selectRegion(e.currentTarget)})},toggleNoImageError:function(){var t=this.el.querySelector('[data-role="noImageError"]'),e=this.$id("image").attr("data-id")?"":g("FORM:ERROR:noImage");t.setCustomValidity(e)},toggleNoRegionsError:function(){var t=this.el.querySelector('[data-role="noRegionsError"]'),e=this.getFormData().regions.length?"":g("FORM:ERROR:noRegions");t.setCustomValidity(e)},serializeToForm:function(){var t=this.model.toJSON();return e.isObject(t.survey)&&(t.survey=t.survey._id||t.survey.id),t},serializeForm:function(t){["pageNumber","dp","minimumDistance","cannyThreshold","circleAccumulatorThreshold","minimumRadius","maximumRadius","filledThreshold","markedThreshold"].forEach(function(e){t[e]=parseFloat(t[e])});var i=this.$id("image")[0];return t.image=i.dataset.id,t.width=parseInt(i.width,10),t.height=parseInt(i.height,10),t.regions=this.$(".opinionSurveyScanTemplates-region").map(function(){return{question:this.dataset.question,options:this.dataset.options.length?this.dataset.options.split(","):[],top:parseInt(this.style.top,10),left:parseInt(this.style.left,10),width:parseInt(this.style.width,10),height:parseInt(this.style.height,10)}}).get().filter(function(t){return!(e.isEmpty(t.question)||"comment"!==t.question&&e.isEmpty(t.options))}),t},selectRegion:function(t){var e=this.$(".is-selected");return t===e[0]?void t.focus():(e.removeClass("is-selected"),void(t&&(t.classList.add("is-selected"),t.style.zIndex=++this.zIndex,t.focus())))},editRegion:function(t){var e=this,i=new h({model:{region:{question:t.dataset.question,options:t.dataset.options.split(",")},survey:this.model.surveys.get(this.$id("survey").val())||null}});this.listenTo(i,"success",function(i){e.updateRegion(t,i.question,i.options),s.closeDialog()}),this.broker.subscribe("viewport.dialog.hidden").setLimit(1).setFilter(function(t){return t===i}).on("message",function(){e.toggleAction(null)}),s.showDialog(i,g("regionEditForm:title"))},getRegionLabel:function(t,e){return l(this.model.surveys.get(e||this.$id("survey").val()),t)},updateRegion:function(t,e,i){t.dataset.question=e,t.dataset.options=i,t.childNodes[0].textContent=this.getRegionLabel(e),this.toggleNoRegionsError()},updateImage:function(t,e,i){this.$id("image").attr({src:"/opinionSurveys/scanTemplates/"+t+".jpg",width:e,height:i,"data-id":t}),this.toggleNoImageError()},leaveAction:e.noop,toggleAction:function(t){return this.$id("toolbar").find(".active").removeClass("active"),t&&this.action!==t?(this.action=t,this.$('.btn[data-action="'+t+'"]').addClass("active").blur(),void this["enter"+t.charAt(0).toUpperCase()+t.substring(1)]()):(this.leaveAction(),this.leaveAction=e.noop,void(this.action=null))},enterEditImage:function(){var t=this,e=new d;this.listenTo(e,"success",function(e){t.updateImage(e.image,e.width,e.height),s.closeDialog()}),this.broker.subscribe("viewport.dialog.hidden").setLimit(1).setFilter(function(t){return t===e}).on("message",function(){t.toggleAction(null)}),s.showDialog(e,g("imageEditForm:title"))},enterMeasureDiameter:function(){this.startDrawing("line",function(t){this.$id("minimumRadius").val(Math.floor(t.value/2*.8)),this.$id("maximumRadius").val(Math.floor(t.value/2*1.2)),this.$id("minimumDistance").val(Math.floor(1.25*t.value))})},enterCreateRegion:function(){this.startDrawing("region",function(i){var n=e.extend({question:null,options:[]},i.value),o=t(c({label:this.getRegionLabel(),region:n}));this.$id("page").append(o),this.selectRegion(o[0]),this.editRegion(o[0])})},startDrawing:function(t,e){this.drawing={enabled:!0,started:!1,finished:!1,mode:t,$el:this.$id(t).css("display","none"),startX:0,startY:0,value:null},this.$id("container").addClass("is-drawing"),this.leaveAction=function(){var t=this.drawing;t.finished&&t.value&&e.call(this,t),t.$el.css("display","none"),t.$el=null,this.$id("container").removeClass("is-drawing")}},onKeyDown:function(t){if(27===t.keyCode)this.toggleAction(null),this.selectRegion(null);else if(46===t.keyCode){var e=this.$(".is-selected");e.length&&(this.selectRegion(null),e.fadeOut("fast",function(){e.remove()}))}},onScroll:function(){var t=this.$id("toolbar");t.toggleClass("is-fixed",window.scrollY>t.offset().top)},onOverlayDown:function(t){var e=this.drawing;e.enabled&&(e.started=!0,e.startX=t.offsetX,e.startY=t.offsetY)},onOverlayMove:function(t){this.drawing.started&&(this.drawing.$el.css("display",""),this.drawItem(t))},onOverlayUp:function(t){this.drawing.started&&(this.drawing.finished=!0,this.drawItem(t),this.toggleAction(null))},drawItem:function(t){var e=this.drawing;"line"===e.mode?this.drawLine(e.startX,e.startY,t.offsetX,t.offsetY):"region"===e.mode&&this.drawRegion(e.startX,e.startY,t.offsetX,t.offsetY)},drawLine:function(t,e,i,n){if(n>e){var o=e;e=n,n=o,o=t,t=i,i=o}var s,a=Math.abs(t-i),r=Math.abs(e-n),l=(t+i)/2,d=(e+n)/2,h=Math.sqrt(a*a+r*r),u=l-h/2,c=d;a=h/2,r=Math.sqrt(Math.abs(t-u)*Math.abs(t-u)+Math.abs(e-c)*Math.abs(e-c)),s=Math.abs(l-u);var g=(r*r-a*a-s*s)/(2*a*s),p=Math.acos(g),f=180*p/Math.PI;this.drawing.$el.css({width:h+"px",transform:"rotate("+f+"deg)",top:c+"px",left:u+"px"}),this.drawing.value=Math.floor(h),this.$id("measuredValue").text(this.drawing.value)},drawRegion:function(t,e,i,n){var o;e>n&&(o=e,e=n,n=o),t>i&&(o=t,t=i,i=o);var s=Math.abs(t-i),a=Math.abs(e-n);this.drawing.$el.css({width:s+"px",height:a+"px",top:e+"px",left:t+"px"}),this.drawing.value={top:e,left:t,width:s,height:a}}})});