define(["underscore","jquery","app/i18n","app/time","app/core/util/getShiftStartInfo","app/core/templates/forms/dateTimeRange"],function(e,t,a,r,n,i){"use strict";var s={date:"YYYY-MM-DD",month:"YYYY-MM","date+time":"YYYY-MM-DD",time:"HH:mm:ss"},u={shifts:["+0+1","-1+0","1","2","3"],days:["+0+1","-1+0","-7+0","-14+0","-28+0"],weeks:["+0+1","-1+0","-2+0","-3+0","-4+0"],months:["+0+1","-1+0","-2+0","-3+0","-6+0"],quarters:["+0+1","1","2","3","4",null],years:["+0+1","-1+0",null,null,null]},o=!1;function l(e){var a=e.currentTarget,r=document.getElementById(a.htmlFor);r&&requestAnimationFrame(function(){r.disabled||t(r).prop("checked",!0).trigger("change")})}function d(n){o||(t(document).on("click",".dateTimeRange-is-input > .dropdown-toggle",l),o=!0);var d=n.type||"date",m={idPrefix:n.idPrefix||"v",property:n.property||"date",formGroup:!1!==n.formGroup,hidden:!0===n.hidden,utc:n.utc?1:0,setTime:!1!==n.setTime?1:0,type:d,startHour:n.startHour||0,shiftLength:n.shiftLength||8,minDate:n.minDate||window.PRODUCTION_DATA_START_DATE||"",maxDate:""===n.maxDate?"":n.maxDate||r.getMoment().add(1,"years").format(s[d]),labels:[],separator:n.separator||"–",required:{date:[!1,!1],time:[!1,!1]}};if(n.required){var f=m.required;"boolean"==typeof n.required?(f.date=[n.required,n.required],f.time=[n.required,n.required]):Array.isArray(n.required)?(f.date=[!!n.required[0],!!n.required[1]],f.time=[!!n.required[0],!!n.required[1]]):(Array.isArray(n.required.date)?f.date=[!!n.required.date[0],!!n.required.date[1]]:f.date=[!!n.required.date,!!n.required.date],Array.isArray(n.required.time)?f.time=[!!n.required.time[0],!!n.required.time[1]]:f.time=[!!n.required.time,!!n.required.time])}return n.labels?Array.isArray(n.labels)?m.labels=[].concat(n.labels):m.labels.push(n.labels):m.labels.push({ranges:!0}),m.labels=m.labels.map(function(t){return{text:t.text||a("core","dateTimeRange:label:"+m.type),dropdown:function(e){return Array.isArray(e.dropdown)?e.dropdown.map(function(e){return"object"==typeof e.attrs&&(e.attrs=Object.keys(e.attrs).map(function(t){return t+'="'+e.attrs[t]+'"'}).join(" ")),e}):null}(t),input:t.input||null,ranges:function(t){if(!0===t.ranges&&(t.ranges=""),"string"!=typeof t.ranges)return null;var a={shifts:!1,days:!0,weeks:!0,months:!0,quarters:!0,years:!0};t.ranges.split(" ").some(function(e){return/^[^+\-]/.test(e)})&&Object.keys(a).forEach(function(e){a[e]=!1});var r=e.assign({},u);return t.ranges.split(" ").forEach(function(e){var t="-"===e.charAt(0)?"-":"+",n=e.replace(/^[^a-z]+/,"").split(":"),i=n.shift(),s=n.length?n[0].split("_"):[];a[i]="+"===t,s.length&&(r[i]=s)}),Object.keys(a).forEach(function(e){r[e]&&a[e]?a[e]=r[e]:delete a[e]}),a}(t)}}),i(m)}return d.handleRangeEvent=function(e){var t=this.$(e.target).closest("a[data-date-time-range]"),a=t.closest(".dateTimeRange"),r=a[0].dataset.type,i="1"===a[0].dataset.utc,u=+a[0].dataset.startHour,o=+a[0].dataset.shiftLength,l=t[0].dataset.dateTimeGroup,d=t[0].dataset.dateTimeRange,m=l,f=1,h=n(Date.now(),{utc:i,startHour:u,shiftLength:o}),c=h.moment,g=null;if(c.hours()<u&&c.subtract(24,"hours"),"shifts"===l?(m="hours",f=o):c.startOf("day"),/^[0-9]+$/.test(d))"shifts"===l?(c.subtract((h.no-1)*h.length,"hours").add((+d-1)*h.length,"hours"),g=c.clone().add(h.length,"hours")):("0"===d?c.startOf(m):c.startOf("year").add(d-1,m),g=c.clone().add(1,m));else{var p=d.match(/^([+-])([0-9]+)([+-])([0-9]+)$/)||[0,"+","0","+","1"];g=c.startOf(m).clone()["+"===p[3]?"add":"subtract"](+p[4]*f,m),c=c["+"===p[1]?"add":"subtract"](+p[2]*f,m)}"shifts"!==l&&(c.hours(u),g.hours(u));var v=s[r];a.find('input[name="from-date"]').val(c.format(v)).trigger("change"),a.find('input[name="from-time"]').val(c.format("HH:mm:ss")).trigger("change"),a.find('input[name="to-date"]').val(g.format(v)).trigger("change"),a.find('input[name="to-time"]').val(g.format("HH:mm:ss")).trigger("change");var y=this.$('[name="interval"]');if(y.length){var q={},b=[];y.each(function(){this.disabled||this.parentNode.classList.contains("disabled")||(q[this.value]=this,b.push(this.value))});var H=function(e,t){var a=36e5;if(e<=8*a)return"hour";var r=24*a;if(e<=9e7)return"shift";if("weeks"===t&&e>11988e5&&e<=243e7)return"week";var n=31*r;return e<=26892e5?"day":e<2.5*n?"week":e>12*n?"year":"month"}(g.valueOf()-c.valueOf(),l);q[H]||(H=b[b.length-1]),H&&y.filter('[value="'+H+'"]').parent().click()}e.altKey&&this.$('[type="submit"]').click()},d.serialize=function(e){var t=e.$(".dateTimeRange"),a=t[0].dataset.type,n=s[a],i="1"===t[0].dataset.utc,u="1"===t[0].dataset.setTime,o=t[0].dataset.startHour,l=t.find('input[name="from-date"]'),d=t.find('input[name="from-time"]'),m=t.find('input[name="to-date"]'),f=t.find('input[name="to-time"]'),h=l.val(),c=d.val(),g=m.val(),p=f.val();(!l.length||h.length<7)&&(h="1970-01-01"),(!m.length||g.length<7)&&(g="1970-01-01"),7===h.length&&(h+="-01"),7===g.length&&(g+="-01");var v=u?(1===o.length?"0":"")+o+":00":"00:00:00";(!d.length||c.length<5)&&(c=v),(!f.length||p.length<5)&&(p=v),5===c.length&&(c+=":00"),5===p.length&&(p+=":00");var y=(i?r.utc:r).getMoment(h+" "+c,"YYYY-MM-DD HH:mm:ss"),q=(i?r.utc:r).getMoment(g+" "+p,"YYYY-MM-DD HH:mm:ss");return b(y)?(l.val(""),d.val(""),y=null):(l.val(y.format(n)),d.val(y.format("HH:mm:ss"))),b(q)?(m.val(""),f.val(""),q=null):(m.val(q.format(n)),f.val(q.format("HH:mm:ss"))),{property:t[0].dataset.property,from:y,to:q};function b(e){return!e.isValid()||"time"!==a&&1970===e.year()}},d.formToRql=function(e,t){var a=d.serialize(e);a.from&&t.push({name:"ge",args:[a.property,a.from.valueOf()]}),a.to&&t.push({name:"lt",args:[a.property,a.to.valueOf()]})},d.rqlToForm=function(e,t,a){var n,i=this.$(".dateTimeRange")[0].dataset,u=s[i.type],o=("1"===i.utc?r.utc:r).getMoment(t.args[1]);"ge"===t.name||"gt"===t.name?n="from":"le"!==t.name&&"lt"!==t.name||(n="to"),n&&o.isValid()&&(a[n+"-date"]=o.format(u),a[n+"-time"]=o.format("HH:mm:ss"))},d});