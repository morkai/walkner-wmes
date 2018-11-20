define(["jquery","app/i18n","app/time","app/core/util/getShiftStartInfo","app/core/templates/forms/dateTimeRange"],function(t,e,a,r,n){"use strict";var s={date:"YYYY-MM-DD",month:"YYYY-MM","date+time":"YYYY-MM-DD",time:"HH:mm:ss"},i={shifts:["+0+1","-1+0","1","2","3"],days:["+0+1","-1+0","-7+0","-14+0","-28+0"],weeks:["+0+1","-1+0","-2+0","-3+0","-4+0"],months:["+0+1","-1+0","-2+0","-3+0","-6+0"],quarters:["+0+1","1","2","3","4",null],years:["+0+1","-1+0",null,null,null]},o=!1;function l(e){var a=e.currentTarget.control;a&&requestAnimationFrame(function(){a.disabled||t(a).prop("checked",!0).trigger("change")})}function u(r){o||(t(document).on("click",".dateTimeRange-is-input > .dropdown-toggle",l),o=!0);var u=r.type||"date",m={idPrefix:r.idPrefix||"v",property:r.property||"date",formGroup:!1!==r.formGroup,utc:r.utc?1:0,setTime:!1!==r.setTime?1:0,type:u,startHour:r.startHour||0,shiftLength:r.shiftLength||8,minDate:r.minDate||window.PRODUCTION_DATA_START_DATE||"",maxDate:""===r.maxDate?"":r.maxDate||a.getMoment().add(1,"years").format(s[u]),labels:[],separator:r.separator||"–",required:{date:!1,time:!1}};if(r.required){var d=m.required;"boolean"==typeof r.required?(d.date=!0,d.time=!0):(d.date=!!r.required.date,d.time=!!r.required.time)}return r.labels?Array.isArray(r.labels)?m.labels=[].concat(r.labels):m.labels.push(r.labels):m.labels.push({ranges:!0}),m.labels=m.labels.map(function(t){return{text:t.text||e("core","dateTimeRange:label:"+m.type),dropdown:function(t){return Array.isArray(t.dropdown)?t.dropdown.map(function(t){return"object"==typeof t.attrs&&(t.attrs=Object.keys(t.attrs).map(function(e){return e+'="'+t.attrs[e]+'"'}).join(" ")),t}):null}(t),input:t.input||null,ranges:function(t){if(!0===t.ranges&&(t.ranges=""),"string"!=typeof t.ranges)return null;var e={shifts:!1,days:!0,weeks:!0,months:!0,quarters:!0,years:!0};t.ranges.split(" ").some(function(t){return/^[^+\-]/.test(t)})&&Object.keys(e).forEach(function(t){e[t]=!1});var a=Object.assign({},i);return t.ranges.split(" ").forEach(function(t){var r="-"===t.charAt(0)?"-":"+",n=t.replace(/^[^a-z]+/,"").split(":"),s=n.shift(),i=n.length?n[0].split("_"):[];e[s]="+"===r,i.length&&(a[s]=i)}),Object.keys(e).forEach(function(t){a[t]&&e[t]?e[t]=a[t]:delete e[t]}),e}(t)}}),n(m)}return u.handleRangeEvent=function(t){var e=this.$(t.target).closest("a[data-date-time-range]"),a=e.closest(".dateTimeRange"),n=a[0].dataset.type,i="1"===a[0].dataset.utc,o=+a[0].dataset.startHour,l=+a[0].dataset.shiftLength,u=e[0].dataset.dateTimeGroup,m=e[0].dataset.dateTimeRange,d=u,f=1,c=r(Date.now(),{utc:i,startHour:o,shiftLength:l}),h=c.moment,p=null;if(h.hours()<o&&h.subtract(24,"hours"),"shifts"===u?(d="hours",f=l):h.startOf("day"),/^[0-9]+$/.test(m))"shifts"===u?(h.subtract((c.no-1)*c.length,"hours").add((+m-1)*c.length,"hours"),p=h.clone().add(c.length,"hours")):("0"===m?h.startOf(d):h.startOf("year").add(m-1,d),p=h.clone().add(1,d));else{var g=m.match(/^([+-])([0-9]+)([+-])([0-9]+)$/)||[0,"+","0","+","1"];p=h.startOf(d).clone()["+"===g[3]?"add":"subtract"](+g[4]*f,d),h=h["+"===g[1]?"add":"subtract"](+g[2]*f,d)}"shifts"!==u&&(h.hours(o),p.hours(o));var v=s[n];a.find('input[name="from-date"]').val(h.format(v)),a.find('input[name="from-time"]').val(h.format("HH:mm:ss")),a.find('input[name="to-date"]').val(p.format(v)),a.find('input[name="to-time"]').val(p.format("HH:mm:ss"));var y=this.$('[name="interval"]');if(y.length){var b={},H=[];y.each(function(){this.disabled||this.parentNode.classList.contains("disabled")||(b[this.value]=this,H.push(this.value))});var Y=function(t,e){const a=36e5;if(t<=8*a)return"hour";const r=24*a;if(t<=9e7)return"shift";if("weeks"===e&&t>11988e5&&t<=243e7)return"week";const n=31*r;return t<=26892e5?"day":t<2.5*n?"week":t>12*n?"year":"month"}(p.valueOf()-h.valueOf(),u);b[Y]||(Y=H[H.length-1]),Y&&y.filter('[value="'+Y+'"]').parent().click()}t.altKey&&this.$('[type="submit"]').click()},u.serialize=function(t){var e=t.$(".dateTimeRange"),r=e[0].dataset.type,n=s[r],i="1"===e[0].dataset.utc,o="1"===e[0].dataset.setTime,l=e[0].dataset.startHour,u=e.find('input[name="from-date"]'),m=e.find('input[name="from-time"]'),d=e.find('input[name="to-date"]'),f=e.find('input[name="to-time"]'),c=u.val(),h=m.val(),p=d.val(),g=f.val();(!u.length||c.length<7)&&(c="1970-01-01"),(!d.length||p.length<7)&&(p="1970-01-01"),7===c.length&&(c+="-01"),7===p.length&&(p+="-01");var v=o?(1===l.length?"0":"")+l+":00":"00:00:00";(!m.length||h.length<5)&&(h=v),(!f.length||g.length<5)&&(g=v),5===h.length&&(h+=":00"),5===g.length&&(g+=":00");var y=(i?a.utc:a).getMoment(c+" "+h,"YYYY-MM-DD HH:mm:ss"),b=(i?a.utc:a).getMoment(p+" "+g,"YYYY-MM-DD HH:mm:ss");return H(y)?(u.val(""),m.val(""),y=null):(u.val(y.format(n)),m.val(y.format("HH:mm:ss"))),H(b)?(d.val(""),f.val(""),b=null):(d.val(b.format(n)),f.val(b.format("HH:mm:ss"))),{property:e[0].dataset.property,from:y,to:b};function H(t){return!t.isValid()||"time"!==r&&1970===t.year()}},u.formToRql=function(t,e){var a=u.serialize(t);a.from&&e.push({name:"ge",args:[a.property,a.from.valueOf()]}),a.to&&e.push({name:"lt",args:[a.property,a.to.valueOf()]})},u.rqlToForm=function(t,e,r){var n,i=this.$(".dateTimeRange")[0].dataset,o=s[i.type],l=("1"===i.utc?a.utc:a).getMoment(e.args[1]);"ge"===e.name||"gt"===e.name?n="from":"le"!==e.name&&"lt"!==e.name||(n="to"),n&&l.isValid()&&(r[n+"-date"]=l.format(o),r[n+"-time"]=l.format("HH:mm:ss"))},u});