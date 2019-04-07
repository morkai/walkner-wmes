define(["underscore","jquery","app/i18n","app/user","app/viewport","i18n!app/nls/mrpControllers"],function(n,t,r,e,o){"use strict";function i(i,p,s){var d=(e.data.mrps||[]).map(function(n){return{id:n,text:n}});if(!d.length||s)return function(i,p){var s=0===p.val().length?"disabled":"",d=["<p>"+r("mrpControllers","ownMrps:info",{link:"#users/"+e.data._id})+"</p>",'<p><button class="btn btn-primary" '+s+">"+r("mrpControllers","ownMrps:save")+"</button></p>"];n.isEmpty(e.data.mrps)&&d.unshift("<p>"+r("mrpControllers","ownMrps:empty")+"</p>");var l=i.$id("ownMrps").popover({trigger:"manual",html:!0,placement:"right",content:d.join("")});l.popover("show"),l.next(".popover").click(function(n){"BUTTON"!==n.target.tagName||n.target.disabled||(n.preventDefault(),function(n,t){o.msg.saving();var r=t.val().split(",").filter(function(n){return n.length>0}),i=n.ajax({method:"PUT",url:"/users/"+e.data._id,data:JSON.stringify({mrps:r})});i.fail(function(){o.msg.savingFailed()}),i.done(function(){o.msg.saved(),e.noReload=!0})}(i,p))}),p.one("select2-focus",a.bind(i)),t(document.body).one("click.ownMrps."+i.idPrefix,a.bind(i))}(i,p);p.select2("data",d),p.change()}function a(){this.$id("ownMrps").popover("destroy"),t(document.body).off(".ownMrps")}return{attach:function(n,e){var o=n.$id("ownMrps");o.attr("data-input-id")||(o.length||t(e[0].labels[0]).append(' (<a id="'+n.idPrefix+'-ownMrps" href="#">'+r("mrpControllers","ownMrps:trigger")+"</a>)"),n.$id("ownMrps").attr("data-input-id",e.prop("id")).on("click",function(t){return i(n,e,t.ctrlKey),!1}),n.off("remove",a,n),n.once("remove",a,n))}}});