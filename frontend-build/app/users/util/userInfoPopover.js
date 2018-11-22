define(["underscore","jquery","app/pubsub","app/time","app/data/prodFunctions","app/data/companies","app/users/templates/userInfoPopover"],function(e,o,n,t,r,u,a){"use strict";var l=["firstName","lastName","login","personellId","email","mobile","prodFunction","company","kdPosition","presence"],s={},i=null,p=null,c=null;function m(t,r){null===i&&(i=n.subscribe("users.edited",function(o){var n=o.model;null===s[n._id]&&(s[n._id]={}),s[n._id]&&e.assign(s[n._id],e.pick(n,Object.keys(l)))})),t.style.cursor="wait";var u=o.ajax({url:"/users/"+r+"?select("+l.join(",")+")"});u.always(function(){t.style.cursor=""}),u.fail(function(){s[r]=null}),u.done(function(e){s[r]=e,d(t,r)})}function d(n,l){if(!p||p[0]!==n){f();var i,m,d=!0,b=s[l],I=r.get(b.prodFunction),g=u.get(b.company),y=(i=b.mobile,m=v(t.format(Date.now(),"HH:mm")).value,e.find(i,function(e){const o=v(e.fromTime),n=v("00:00"===e.toTime?"24:00":e.toTime);return n.value<o.value?m<n.value||m>=o.value:o.value<n.value&&m>=o.value&&m<n.value}));y&&(/^\+48[0-9]{9}$/.test(y.number)?y.label=y.number.substr(3,3)+" "+y.number.substr(6,3)+" "+y.number.substr(9,3):y.label=y.number),c||(c=o(o.fn.popover.Constructor.DEFAULTS.template).addClass("userInfoPopover")[0].outerHTML),(p=o(n).popover({placement:"top",container:n.parentNode,trigger:"manual",html:!0,content:a({userInfo:{_id:b._id,name:b.firstName&&b.lastName?b.firstName+" "+b.lastName:b.login,personnelId:b.personellId,position:b.kdPosition||(I?I.getLabel():null),company:g?g.getLabel():b.company,email:b.email,mobile:y}}),template:c})).on("click.userInfoPopover",function(){return d?d=!1:f(),!1}),p.on("mouseleave.userInfoPopover",function(){d&&f()}),p.popover("show")}}function f(){p&&(p.off(".userInfoPopover"),p.popover("destroy"),p=null,o(".userInfoPopover").remove())}function v(e){const o=e.split(":"),n=parseInt(o[0],10),t=parseInt(o[1],10);return{hours:n,minutes:t,value:1e3*n+t}}o(document.body).on("click",function(e){p&&(o(e.target).closest(".popover").length?setTimeout(f,1):f())}),o(document.body).on("mouseenter",".userInfo-label",function(e){var o=e.currentTarget.parentNode,n=o.dataset.userId;if(n)return s[n]?d(o,n):void(null!==s[n]&&m(o,n))})});