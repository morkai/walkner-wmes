define(["underscore","jquery","app/i18n","app/time","app/core/util/getShiftStartInfo","app/core/templates/forms/dateTimeRange"],function(e,t,a,r,n,i){"use strict";var s={date:"YYYY-MM-DD",month:"YYYY-MM","date+time":"YYYY-MM-DD",time:"HH:mm:ss"},l={shifts:["+0+1","-1+0","1","2","3"],days:["+0+1","-1+0","-7+0","-14+0","-28+0"],weeks:["+0+1","-1+0","-2+0","-3+0","-4+0"],months:["+0+1","-1+0","-2+0","-3+0","-6+0"],quarters:["+0+1","1","2","3","4",null],years:["+0+1","-1+0",null,null,null]},o=!1;function d(e){var a=e.currentTarget,r=document.getElementById(a.htmlFor);r&&requestAnimationFrame(function(){r.disabled||t(r).prop("checked",!0).trigger("change")})}function u(n){o||(t(document).on("click",".dateTimeRange-is-input > .dropdown-toggle",d),o=!0);var f=n.type||"date",g={idPrefix:n.idPrefix||"v",property:n.property||"date",formGroup:!1!==n.formGroup,hidden:!0===n.hidden,utc:n.utc?1:0,setTime:!1!==n.setTime?1:0,type:f,startHour:n.startHour||0,shiftLength:n.shiftLength||8,minDate:n.minDate||window.PRODUCTION_DATA_START_DATE||"",maxDate:""===n.maxDate?"":n.maxDate||r.getMoment().add(1,"years").format(s[f]),labelProperty:n.labelProperty||"dateFilter",labels:[],maxLabels:2,separator:n.separator||"–",required:{date:[!1,!1],time:[!1,!1]}};if(n.required){var c=g.required;"boolean"==typeof n.required?(c.date=[n.required,n.required],c.time=[n.required,n.required]):Array.isArray(n.required)?(c.date=[!!n.required[0],!!n.required[1]],c.time=[!!n.required[0],!!n.required[1]]):(Array.isArray(n.required.date)?c.date=[!!n.required.date[0],!!n.required.date[1]]:c.date=[!!n.required.date,!!n.required.date],Array.isArray(n.required.time)?c.time=[!!n.required.time[0],!!n.required.time[1]]:c.time=[!!n.required.time,!!n.required.time])}if(n.labels?Array.isArray(n.labels)?g.labels=[].concat(n.labels):g.labels.push(n.labels):g.labels.push({ranges:!0}),g.labels=g.labels.map(function(t){return{text:t.text||a("core","dateTimeRange:label:"+g.type),dropdown:function(e){return Array.isArray(e.dropdown)?e.dropdown.map(function(e){return"object"==typeof e.attrs&&(e.attrs=Object.keys(e.attrs).map(function(t){return t+'="'+e.attrs[t]+'"'}).join(" ")),e}):null}(t),value:t.value||null,ranges:function(t){if(!0===t.ranges&&(t.ranges=""),"string"!=typeof t.ranges)return null;var a={shifts:!1,days:!0,weeks:!0,months:!0,quarters:!0,years:!0};t.ranges.split(" ").some(function(e){return/^[^+\-]/.test(e)})&&Object.keys(a).forEach(function(e){a[e]=!1});var r=e.assign({},l);return t.ranges.split(" ").forEach(function(e){var t="-"===e.charAt(0)?"-":"+",n=e.replace(/^[^a-z]+/,"").split(":"),i=n.shift(),s=n.length?n[0].split("_"):[];a[i]="+"===t,s.length&&(r[i]=s)}),Object.keys(a).forEach(function(e){r[e]&&a[e]?a[e]=r[e]:delete a[e]}),a}(t)}}),g.labels.length>g.maxLabels){var h=g.idPrefix+"-dateTimeRange-"+g.property;requestAnimationFrame(function(){t("#"+h).on("click","a[data-label-value]",m),u.toggleLabel(h)})}return i(g)}function m(e){var a=t(e.currentTarget).closest(".dateTimeRange-labels"),r=e.currentTarget.dataset.labelValue,n=a.find('.dateTimeRange-label-input[value="'+r+'"]');return n.prop("checked",!0),u.toggleLabel(a.closest(".dateTimeRange").prop("id")),n.closest(".dropdown-toggle").click(),!1}return u.handleRangeEvent=function(e){var t=this.$(e.target).closest("a[data-date-time-range]"),a=t.closest(".dateTimeRange"),r=a[0].dataset.type,i="1"===a[0].dataset.utc,l=+a[0].dataset.startHour,o=+a[0].dataset.shiftLength,d=t[0].dataset.dateTimeGroup,u=t[0].dataset.dateTimeRange,m=d,f=1,g=n(Date.now(),{utc:i,startHour:l,shiftLength:o}),c=g.moment,h=null;if(c.hours()<l&&c.subtract(24,"hours"),"shifts"===d?(m="hours",f=o):c.startOf("day"),/^[0-9]+$/.test(u))"shifts"===d?(c.subtract((g.no-1)*g.length,"hours").add((+u-1)*g.length,"hours"),h=c.clone().add(g.length,"hours")):("0"===u?c.startOf(m):c.startOf("year").add(u-1,m),h=c.clone().add(1,m));else{var p=u.match(/^([+-])([0-9]+)([+-])([0-9]+)$/)||[0,"+","0","+","1"];h=c.startOf(m).clone()["+"===p[3]?"add":"subtract"](+p[4]*f,m),c=c["+"===p[1]?"add":"subtract"](+p[2]*f,m)}"shifts"!==d&&(c.hours(l),h.hours(l));var v=s[r];a.find('input[name="from-date"]').val(c.format(v)).trigger("change"),a.find('input[name="from-time"]').val(c.format("HH:mm:ss")).trigger("change"),a.find('input[name="to-date"]').val(h.format(v)).trigger("change"),a.find('input[name="to-time"]').val(h.format("HH:mm:ss")).trigger("change");var y=this.$('[name="interval"]');if(y.length){var b={},T=[];y.each(function(){this.disabled||this.parentNode.classList.contains("disabled")||(b[this.value]=this,T.push(this.value))});var q=function(e,t){var a=36e5;if(e<=8*a)return"hour";var r=24*a;if(e<=9e7)return"shift";if("weeks"===t&&e>11988e5&&e<=243e7)return"week";var n=31*r;return e<=26892e5?"day":e<2.5*n?"week":e>12*n?"year":"month"}(h.valueOf()-c.valueOf(),d);b[q]||(q=T[T.length-1]),q&&y.filter('[value="'+q+'"]').parent().click()}e.altKey&&this.$('[type="submit"]').click()},u.serialize=function(e){var t=e.$(".dateTimeRange"),a=t[0].dataset.type,n=s[a],i="1"===t[0].dataset.utc,l="1"===t[0].dataset.setTime,o=t[0].dataset.startHour,d=t.find('input[name="from-date"]'),u=t.find('input[name="from-time"]'),m=t.find('input[name="to-date"]'),f=t.find('input[name="to-time"]'),g=d.val(),c=u.val(),h=m.val(),p=f.val();(!d.length||g.length<7)&&(g="1970-01-01"),(!m.length||h.length<7)&&(h="1970-01-01"),7===g.length&&(g+="-01"),7===h.length&&(h+="-01");var v=l?(1===o.length?"0":"")+o+":00":"00:00:00";(!u.length||c.length<5)&&(c=v),(!f.length||p.length<5)&&(p=v),5===c.length&&(c+=":00"),5===p.length&&(p+=":00");var y=(i?r.utc:r).getMoment(g+" "+c,"YYYY-MM-DD HH:mm:ss"),b=(i?r.utc:r).getMoment(h+" "+p,"YYYY-MM-DD HH:mm:ss");q(y)?(d.val(""),u.val(""),y=null):(d.val(y.format(n)),u.val(y.format("HH:mm:ss"))),q(b)?(m.val(""),f.val(""),b=null):(m.val(b.format(n)),f.val(b.format("HH:mm:ss")));var T=t.find(".dateTimeRange-label-input:checked");return{property:T.length?T.val():t[0].dataset.property,from:y,to:b};function q(e){return!e.isValid()||"time"!==a&&1970===e.year()}},u.formToRql=function(e,t){var a=u.serialize(e);a.from&&t.push({name:"ge",args:[a.property,a.from.valueOf()]}),a.to&&t.push({name:"lt",args:[a.property,a.to.valueOf()]})},u.rqlToForm=function(e,t,a){var n,i=this.$(".dateTimeRange"),l=i.find(".dateTimeRange-label-input").first().prop("name"),o=i[0].dataset,d=s[o.type],u=("1"===o.utc?r.utc:r).getMoment(t.args[1]);"ge"===t.name||"gt"===t.name?n="from":"le"!==t.name&&"lt"!==t.name||(n="to"),n&&u.isValid()&&(l&&(a[l]=e),a[n+"-date"]=u.format(d),a[n+"-time"]=u.format("HH:mm:ss"))},u.toggleLabel=function(e){var a=("string"==typeof e?t("#"+e):e.$(".dateTimeRange").first()).find(".dateTimeRange-labels");a.hasClass("dateTimeRange-labels-overflow")&&a.find(".dateTimeRange-label").each(function(){this.classList.toggle("hidden",!t(this).find(".dateTimeRange-label-input").prop("checked"))})},u});