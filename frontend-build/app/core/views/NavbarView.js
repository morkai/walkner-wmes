define(["require","underscore","app/i18n","app/user","app/time","app/viewport","app/data/orgUnits","app/data/localStorage","app/data/loadedModules","app/core/View","app/mor/Mor","app/mor/views/MorView","app/users/util/setUpUserSelect2","app/core/templates/navbar/searchResults"],function(e,t,a,s,i,r,n,o,l,h,c,u,d,p){"use strict";var f={};n.getAllByType("division").forEach(function(e){f[e.id.replace(/[^A-Za-z0-9]/g,"").toUpperCase()]=e.id});var v=h.extend({nlsDomain:"core",localTopics:{"router.executing":function(e){this.activateNavItem(e.req.path)},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")},"viewport.page.shown":function(){this.collapse()},"viewport.dialog.shown":function(){this.collapse()}},events:{"shown.bs.collapse":function(){this.broker.publish("navbar.shown")},"hidden.bs.collapse":function(){this.broker.publish("navbar.hidden")},"click .disabled a":function(e){e.preventDefault()},"click .navbar-account-locale":function(e){e.preventDefault(),this.changeLocale(e.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(e){e.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(e){e.preventDefault(),this.trigger("logOut")},"click .navbar-feedback":function(e){e.preventDefault(),e.target.disabled=!0,this.trigger("feedback",function(){e.target.disabled=!1})},"mouseup .btn[data-href]":function(e){if(2!==e.button){var t=e.currentTarget.dataset.href,a=e.currentTarget.dataset.target;return e.ctrlKey||1===e.button||a&&"_self"!==a?window.open(t,a):window.location.href=t,document.body.click(),!1}},"submit #-search":function(){return!1},"focus #-searchPhrase":function(){clearTimeout(this.timers.hideSearchResults),this.handleSearch()},"blur #-searchPhrase":function(){clearTimeout(this.timers.hideSearchResults),this.timers.hideSearchResults=setTimeout(this.hideSearchResults.bind(this),250)},"keydown #-searchPhrase":function(e){return 13===e.keyCode?(this.selectActiveSearchResult(),!1):38===e.keyCode?(this.selectPrevSearchResult(),!1):40===e.keyCode?(this.selectNextSearchResult(),!1):void 0},"keyup #-searchPhrase":function(e){return 13!==e.keyCode&&38!==e.keyCode&&40!==e.keyCode&&(27===e.keyCode?(e.target.value="",this.handleSearch(),!1):void(e.target.value.length<=1?this.handleSearch():(this.timers.handleSearch&&clearTimeout(this.timers.handleSearch),this.timers.handleSearch=setTimeout(this.handleSearch.bind(this),1e3/30))))},"mouseup #-mor":function(e){if(!e.ctrlKey&&0===e.button)return this.showMor(),!1},"click #-mor":function(e){if(!e.ctrlKey&&0===e.button)return!1},"click #-openLayout":function(e){if(0===e.button){var t=window.screen,a=.8*t.availWidth,s=.9*t.availHeight,i=Math.floor((t.availWidth-a)/2),r="resizable,scrollbars,location=no,top="+(Math.floor((t.availHeight-s)/2)-(t.height-t.availHeight))+",left="+i+",width="+Math.floor(a)+",height="+Math.floor(s),n=window.open(e.target.href,"WMES_LAYOUT",r);return n?n.focus():window.location.href=e.target.href,!1}},"click a[data-group]":function(e){return this.toggleGroup(e.currentTarget.dataset.group),e.currentTarget.blur(),!1}}});return v.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting",loadedModules:{}},v.prototype.initialize=function(){t.defaults(this.options,v.DEFAULT_OPTIONS),this.activeModuleName=null,this.navItems=null,this.$activeNavItem=null,this.lastSearchPhrase="",this.initialPath=this.options.currentPath},v.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},v.prototype.afterRender=function(){this.broker.publish("navbar.render",{view:this}),null!==this.initialPath?(this.activateNavItem(this.initialPath),this.initialPath=null):this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries(),this.toggleGroups(),this.broker.publish("navbar.rendered",{view:this})},v.prototype.activateNavItem=function(e){this.navItems||this.cacheNavItems();for(var t=e.substring(1).match(/^([a-zA-Z0-9\/\-_]+)/),a=this.getNavItemKeysFromPath(t?t[1]:""),s="",i=a.length-1;i>=0;--i){var r=a[i];if(this.navItems[r]){s=r;break}}s!==this.activeModuleName&&(this.activeModuleName=s,this.selectActiveNavItem())},v.prototype.changeLocale=function(e){a.reload(e)},v.prototype.setConnectionStatus=function(e){if(this.isRendered()){var t=this.$(".navbar-account-status");t.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),t.addClass(this.options[e+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===e)}},v.prototype.getModuleNameFromLi=function(e,t,a){var s=e.dataset[a?"clientModule":"module"];if(void 0===s&&!t)return"";if(s)return s;var i=e.querySelector("a");if(!i)return"";var r=i.getAttribute("href");return r?this.getModuleNameFromPath(r):""},v.prototype.getModuleNameFromPath=function(e){if("/"!==e[0]&&"#"!==e[0]||(e=e.substr(1)),""===e)return"";var t=e.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return t?t[1]:""},v.prototype.selectActiveNavItem=function(){if(this.isRendered()){this.navItems||this.cacheNavItems();var e=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(e);var t=this.navItems[this.activeModuleName];!t&&r.currentPage&&r.currentPage.navbarModuleName&&(t=this.navItems[r.currentPage.navbarModuleName]),t?(t.addClass(e),this.$activeNavItem=t):this.$activeNavItem=null}},v.prototype.cacheNavItems=function(){var e=this;e.navItems={},e.$(".nav > li").each(function(){e.cacheNavItem(this)})},v.prototype.cacheNavItem=function(e){var t=this,a=t.$(e);a.hasClass(t.options.activeItemClassName)&&(t.$activeNavItem=a);var s=a.find("a").first().attr("href");s&&"#"===s.charAt(0)?t.getNavItemKeysFromLi(a[0]).forEach(function(e){t.navItems[e]||(t.navItems[e]=a)}):a.hasClass("dropdown")&&a.find(".dropdown-menu > li").each(function(){t.getNavItemKeysFromLi(this).forEach(function(e){t.navItems[e]||(t.navItems[e]=a)})})},v.prototype.getNavItemKeysFromLi=function(e){var t=e.querySelector("a");if(!t)return[""];var a=e.dataset.navPath;if(!a){var s=t.getAttribute("href");if(!s||"/"!==s.charAt(0)&&"#"!==s.charAt(0))return[""];a=s.substring(1)}var i=a.match(/^([a-zA-Z0-9\/\-_]+)/);return i?this.getNavItemKeysFromPath(i[1]):[""]},v.prototype.getNavItemKeysFromPath=function(e){var t=[];return e.split("/").forEach(function(e,a){t[a-1]&&(e=t[a-1]+"/"+e),t.push(e)}),t},v.prototype.hideNotAllowedEntries=function(){var e=this,a=s.isLoggedIn(),i=[],r=[];function n(e){return e.hasClass("divider")?(r.push(e),!0):!!e.hasClass("dropdown-header")&&(i.push(e),!0)}function o(i){if(window.NAVBAR_ITEMS&&!1===window.NAVBAR_ITEMS[i.attr("data-item")])return!1;var r=i.attr("data-loggedin");if("string"==typeof r&&(r="0"!==r)!==a)return!1;var n=e.getModuleNameFromLi(i[0],!1);if(""!==n&&void 0===i.attr("data-no-module")&&t.some(n.split(" "),function(t){return!e.options.loadedModules[t]}))return!1;var o=i.attr("data-privilege");return void 0===o||s.isAllowedTo.apply(s,o.split(" "))}this.$(".navbar-nav > li").each(function(){var t=e.$(this);n(t)||(t[0].style.display=o(t)&&function e(t){if(!t.hasClass("dropdown"))return!0;var a=!0;t.find("> .dropdown-menu > li").each(function(){var s=t.find(this);if(!n(s)){var i=o(s)&&e(s);s[0].style.display=i?"":"none",a=a||i}});return a}(t)?"":"none")}),i.forEach(function(t){t[0].style.display=e.hasVisibleSiblings(t,"next")?"":"none"}),r.forEach(function(t){t[0].style.display=e.hasVisibleSiblings(t,"prev")&&e.hasVisibleSiblings(t,"next")?"":"none"}),this.$(".btn[data-privilege]").each(function(){this.style.display=s.isAllowedTo.apply(s,this.dataset.privilege.split(" "))?"":"none"})},v.prototype.hasVisibleSiblings=function(e,t){var a=e[t+"All"]().filter(function(){return"none"!==this.style.display});return!!a.length&&!a.first().hasClass("divider")},v.prototype.hideEmptyEntries=function(){var e=this;this.$(".dropdown > .dropdown-menu").each(function(){var t=e.$(this),a=!1;t.children().each(function(){a=a||"none"!==this.style.display}),a||(t.parent()[0].style.display="none")})},v.prototype.toggleConnectionStatusEntries=function(e){var t=this;this.$("li[data-online]").each(function(){var a=t.$(this);if(void 0!==a.attr("data-disabled"))return a.addClass("disabled");switch(a.attr("data-online")){case"show":a[0].style.display=e?"":"none";break;case"hide":a[0].style.display=e?"none":"";break;default:a[e?"removeClass":"addClass"]("disabled")}})},v.prototype.handleSearch=function(){var e=this.$id("searchPhrase").val().trim();if(e!==this.lastSearchPhrase){var t=this.parseSearchPhrase(e);this.$id("searchResults").replaceWith(this.renderSearchResults(t));var a=this.$id("searchResults").children().last();a.hasClass("divider")&&a.remove(),this.lastSearchPhrase=e,t.searchName&&this.scheduleUserSearch(t.searchName)}this.showNoSearchResults(e),this.showSearchResults()},v.prototype.showNoSearchResults=function(e){this.$(".navbar-search-result").length||this.$id("searchResults").html('<li class="disabled"><a>'+this.t("NAVBAR:SEARCH:"+(""===e?"help":"empty"))+"</a></li>")},v.prototype.showSearchResults=function(){var e=this.$id("search");e.find(".active").removeClass("active"),e.find(".navbar-search-result").first().addClass("active"),e.addClass("open")},v.prototype.hideSearchResults=function(){this.$id("search").removeClass("open").find(".active").removeClass("active"),document.activeElement===this.$id("searchPhrase")[0]&&this.$id("searchPhrase").blur()},v.prototype.selectPrevSearchResult=function(){var e=this.$(".navbar-search-result");if(e.length){for(var t=e.filter(".active").removeClass("active"),a=e.length-1;a>=0;--a){if(e[a]===t[0])break}(t=0===a?e.last():e.eq(a-1)).addClass("active")}},v.prototype.selectNextSearchResult=function(){var e=this.$(".navbar-search-result");if(e.length){for(var t=e.filter(".active").removeClass("active"),a=0;a<e.length;++a){if(e[a]===t[0])break}(t=a===e.length-1?e.first():e.eq(a+1)).addClass("active")}},v.prototype.selectActiveSearchResult=function(){var e,t,a=this,s=a.$id("searchResults").find(".active").find("a"),i=s.prop("target"),r=s.prop("href");r&&("_blank"!==i?(e=a.broker.subscribe("viewport.page.shown",function(){e.cancel(),t.cancel(),a.hideSearchResults()}),t=a.broker.subscribe("viewport.page.loadingFailed",function(){e.cancel(),t.cancel()}),window.location.href=r):window.open(r,i))},v.prototype.renderSearchResults=function(t){var a={loadedModules:l,results:t,oshEntries:[]};if(l.isLoaded("wmes-osh")){var s=e("app/wmes-osh-common/dictionaries");Object.keys(s.TYPE_TO_PREFIX).forEach(function(e){a.oshEntries.push({type:e,prefix:s.TYPE_TO_PREFIX[e],module:s.TYPE_TO_MODULE[e]})})}return this.renderPartial(p,a)},v.prototype.parseSearchPhrase=function(t){var a,s=l.isLoaded("production"),r={fullOrderNo:null,partialOrderNo:null,fullNc12:null,partialNc12:null,fullNc15:null,oshEntry:null,entryId:null,year:null,month:null,day:null,shift:null,from:null,to:null,fromShift:null,toShift:null,shiftStart:null,shiftEnd:null,division:null,searchName:null};if(t=" "+t.toUpperCase()+" ",Object.keys(f).forEach(function(e){var a=t.indexOf(e);-1!==a&&" "===t.substr(a+e.length,1)&&(r.division=f[e],t=t.replace(e,""))}),l.isLoaded("orderDocuments")&&(a=t.match(/[^0-9A-Z]([0-9]{15})[^0-9A-Z]/))&&(r.fullNc15=a[1],t=t.replace(r.fullNc15,"")),s&&((a=t.match(/[^0-9A-Z]([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})[^0-9A-Z]/))&&(12===a[1].length||/[0-9]+/.test(a[1]))&&(r.fullNc12=a[1].toUpperCase(),t=t.replace(/([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})/g,"")),(a=t.match(/[^0-9](1[0-9]{8})[^0-9]/))&&(r.fullOrderNo=a[1],/^1111/.test(a[1])&&(r.partialNc12=a[1]),t=t.replace(/(1[0-9]{8})/g,""))),l.isLoaded("wmes-osh")&&(a=t.match(/[^0-9]([ZKAO])[^0-9]?([0-9]{4})?[^0-9]?([0-9]{1,6})[^0-9]/))){var n=e("app/wmes-osh-common/dictionaries"),o=a[1],h=n.PREFIX_TO_TYPE[o],c=a[2]||i.format(Date.now(),"YYYY"),u=parseInt(a[3],10).toString().padStart(6,"0");r.oshEntry={type:h,module:n.TYPE_TO_MODULE[h],rid:o+"-"+c+"-"+u},t=t.replace(/([ZKAO]).?([0-9]{4})?.?([0-9]{1,6})/g,"")}(a=t.match(/[^A-Z0-9](I{1,3})[^A-Z0-9]/))&&(r.shift="I"===a[1].toUpperCase()?1:"II"===a[1].toUpperCase()?2:3,t=t.replace(/I{1,3}/g,""));var p=null,v="days";return(a=t.match(/[^0-9]([0-9]{1,4})[^0-9]([0-9]{1,4})(?:[^0-9]([0-9]{1,4}))?[^0-9]/))&&(r.month=+a[2],4===a[1].length?(v="months",r.year=+a[1],r.day=+a[3]||1):a[3]||4!==a[2].length?a[3]&&4===a[3].length?(r.day=+a[1],r.year=+a[3]):a[3]?(r.day=+a[1],r.year=parseInt(a[3],10)+2e3):(r.day=+a[1],r.year=+i.format(Date.now(),"YYYY")):(v="months",r.year=+a[2],r.month=+a[1],r.day=1),t=t.replace(/[0-9]{1,4}[^0-9][0-9]{1,4}([^0-9][0-9]{1,4})?/g,""),p=i.getMoment(r.year+"-"+r.month+"-"+r.day,"YYYY-MM-DD")),!p&&r.shift&&(p=i.getMoment(Date.now()).startOf("day"),r.year=p.year(),r.month=p.month(),r.day=p.day()),p&&p.isValid()?(r.from=p.valueOf(),r.fromShift=p.hours(6).valueOf(),r.shiftStart=r.fromShift+288e5*((r.shift||1)-1),r.toShift=p.add(1,v).valueOf(),r.shiftEnd=r.shift?r.shiftStart+288e5:r.toShift,r.to=p.startOf("day").valueOf()):(r.year=null,r.month=null,r.day=null),a=d.transliterate(t).match(/([A-Z]{3,})/),!r.division&&a&&(r.searchName=a[1]),(a=t.match(/([0-9]+)/))&&(s&&/^1[0-9]*$/.test(a[1])&&a[1].length<9&&(r.partialOrderNo=a[1]),/^[0-9]{1,6}$/.test(a[1])&&(r.entryId=a[1]),s&&a[1].length<12&&(r.partialNc12=a[1].toUpperCase())),r.fullOrderNo&&r.partialOrderNo&&(r.partialOrderNo=null),r.fullNc12&&r.partialNc12&&(r.partialNc12=null),r},v.prototype.showMor=function(){if("mor"!==r.currentPage.pageId){var e=this.$id("mor").addClass("disabled");e.find(".fa").removeClass("fa-group").addClass("fa-spinner fa-spin");var t=new u({model:new c});t.model.fetch().done(function(){r.showDialog(t)}).always(function(){e.removeClass("disabled").find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-group")})}},v.prototype.scheduleUserSearch=function(e){this.timers.searchUsers&&clearTimeout(this.timers.searchUsers),this.timers.searchUsers=setTimeout(this.searchUsers.bind(this,e),300)},v.prototype.searchUsers=function(e){var t=this;t.searchUsersReq&&t.searchUsersReq.abort();var a=t.searchUsersReq=this.ajax({url:"/users?limit(20)&searchName=regex="+encodeURIComponent("^"+e)});a.done(function(a){var s=t.$id("searchName"),i=s.next().detach();i.removeClass("active").find(".fa").remove();var r=d.filterDuplicates(a.collection);if(0===r.length)return s.remove(),void t.showNoSearchResults(e);r.slice(0,5).reverse().forEach(function(e){var t=i.clone(),a=e.lastName||e.firstName?(e.lastName+" "+e.firstName).trim():e.login;t.find("a").attr("href","#users/"+e._id).text(a),t.insertAfter(s)}),s.next().addClass("active").focus()}),a.fail(function(){t.$id("searchName").find(".fa-spin").removeClass(".fa-spin")}),a.always(function(){a===t.searchUsersReq&&(t.searchUsersReq=null)})},v.prototype.toggleGroups=function(){var e=this,a=JSON.parse(o.getItem("WMES_NAVBAR_GROUPS")||"{}"),i={};e.$("a[data-group]").each(function(){var e=this.dataset.group.split("/")[0];i[e]||(i[e]=[]),!this.dataset.privilege||s.isAllowedTo.apply(s,this.dataset.privilege.split(" "))?(i[e].push(this.dataset.group),a[e]||(a[e]=this.dataset.group)):this.parentNode.removeChild(this)}),Object.keys(a).forEach(function(s){var r=i[s];t.isEmpty(r)||(a[s]&&-1!==r.indexOf(a[s])||(a[s]=r[0]),e.toggleGroup(a[s]))})},v.prototype.toggleGroup=function(e){var t=e.split("/");this.$('a[data-group^="'+t[0]+'"]').each(function(){this.classList.toggle("active",this.dataset.group===e)}),this.$('li[data-group^="'+t[0]+'"]').each(function(){this.classList.toggle("navbar-group-hidden",this.dataset.group!==e)});var a=JSON.parse(o.getItem("WMES_NAVBAR_GROUPS")||"{}");a[t[0]]=e,o.setItem("WMES_NAVBAR_GROUPS",JSON.stringify(a))},v.prototype.collapse=function(){this.$(".navbar-collapse.in").length&&this.$(".navbar-toggle").click()},v});