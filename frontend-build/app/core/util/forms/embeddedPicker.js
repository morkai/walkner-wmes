define(["underscore","jquery","app/viewport","app/core/util/embedded","app/core/util/html","app/core/templates/forms/embeddedPicker"],function(e,d,r,i,l,o){"use strict";function t(e){return e.toUpperCase().replace(/[^A-Z0-9]+/g,"")}function n(e,d){var r=t(e.find(".form-embeddedPicker-filter").val()),i="",l=e.find(".form-embeddedPicker-value").val();d.forEach(function(e){-1!==e.filter.indexOf(r)&&(i+='<button class="btn btn-default '+(e.value===l?"active":"")+'" type="button" value="'+e.value+'"><span class="form-embeddedPicker-label">'+e.label+'</span><span class="form-embeddedPicker-description">'+e.description+"</span></button>")}),e.find(".form-embeddedPicker-options").html(i)}return function(i,l){l=Object.assign({label:"?",placeholder:"",filter:"",options:[]},l);var a=d(o({required:i.prop("required"),label:l.label,placeholder:l.placeholder,filter:l.filter})),c=l.options.map(function(d){return{value:e.escape(d.value),label:e.escape(d.label||d.value),description:e.escape(d.description||""),filter:t((d.label||d.value)+(d.description||""))}}).sort(function(e,d){return e.label.localeCompare(d.label,void 0,{numeric:!0,ignorePunctuation:!0})});a.find(".form-embeddedPicker-clear").on("click",function(){i.val(""),a.find(".form-embeddedPicker-selected").text(l.placeholder)}),a.find(".form-embeddedPicker-selected").on("click",function(){a.addClass("form-embeddedPicker-selecting"),a.find(".form-embeddedPicker-filter").val("").focus(),n(a,c);var e=a.find(".active");e.length?e[0].scrollIntoView():a.find(".form-embeddedPicker-options")[0].scrollTop=0,r.currentDialog&&r.$dialog.modal("adjustBackdrop")}),a.find(".form-embeddedPicker-filter").on("input",function(){n(a,c)}),a.find(".form-embeddedPicker-options").on("click",".btn",function(e){i.val(e.currentTarget.value),a.find(".form-embeddedPicker-selected").html(e.currentTarget.innerHTML),a.removeClass("form-embeddedPicker-selecting"),r.currentDialog&&r.$dialog.modal("adjustBackdrop")}),a.insertAfter(i),i.addClass("form-embeddedPicker-value").appendTo(a.find(".form-embeddedPicker-buttons"));var f=a.find(".form-embeddedPicker-selected");f.css("width",f.outerWidth()+"px"),r.currentDialog&&r.$dialog.modal("adjustBackdrop")}});