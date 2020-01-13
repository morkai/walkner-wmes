define(["underscore","app/i18n","app/user","app/time","app/viewport","app/data/orgUnits","app/data/localStorage","../View","app/mor/Mor","app/mor/views/MorView","app/users/util/setUpUserSelect2","app/core/templates/navbar","app/core/templates/navbar/searchResults"],function(e,t,a,s,i,r,n,o,l,h,c,u,d){"use strict";var p={};r.getAllByType("division").forEach(function(e){p[e.id.replace(/[^A-Za-z0-9]/g,"").toUpperCase()]=e.id});var f=o.extend({template:u,nlsDomain:"core",localTopics:{"router.executing":function(e){this.activateNavItem(this.getModuleNameFromPath(e.req.path))},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")},"viewport.page.shown":function(){this.collapse()},"viewport.dialog.shown":function(){this.collapse()}},events:{"shown.bs.collapse":function(){this.broker.publish("navbar.shown")},"hidden.bs.collapse":function(){this.broker.publish("navbar.hidden")},"click .disabled a":function(e){e.preventDefault()},"click .navbar-account-locale":function(e){e.preventDefault(),this.changeLocale(e.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(e){e.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(e){e.preventDefault(),this.trigger("logOut")},"click .navbar-feedback":function(e){e.preventDefault(),e.target.disabled=!0,this.trigger("feedback",function(){e.target.disabled=!1})},"mouseup .btn[data-href]":function(e){if(2!==e.button){var t=e.currentTarget.dataset.href;return e.ctrlKey||1===e.button?window.open(t):window.location.href=t,document.body.click(),!1}},"submit #-search":function(){return!1},"focus #-searchPhrase":function(){clearTimeout(this.timers.hideSearchResults),this.handleSearch()},"blur #-searchPhrase":function(){clearTimeout(this.timers.hideSearchResults),this.timers.hideSearchResults=setTimeout(this.hideSearchResults.bind(this),250)},"keydown #-searchPhrase":function(e){return 13===e.keyCode?(this.selectActiveSearchResult(),!1):38===e.keyCode?(this.selectPrevSearchResult(),!1):40===e.keyCode?(this.selectNextSearchResult(),!1):void 0},"keyup #-searchPhrase":function(e){return 13!==e.keyCode&&38!==e.keyCode&&40!==e.keyCode&&(27===e.keyCode?(e.target.value="",this.handleSearch(),!1):void(e.target.value.length<=1?this.handleSearch():(this.timers.handleSearch&&clearTimeout(this.timers.handleSearch),this.timers.handleSearch=setTimeout(this.handleSearch.bind(this),1e3/30))))},"mouseup #-mor":function(e){if(!e.ctrlKey&&0===e.button)return this.showMor(),!1},"click #-mor":function(e){if(!e.ctrlKey&&0===e.button)return!1},"click #-openLayout":function(e){if(0===e.button){var t=window.screen,a=.8*t.availWidth,s=.9*t.availHeight,i=Math.floor((t.availWidth-a)/2),r="resizable,scrollbars,location=no,top="+(Math.floor((t.availHeight-s)/2)-(t.height-t.availHeight))+",left="+i+",width="+Math.floor(a)+",height="+Math.floor(s),n=window.open(e.target.href,"WMES_LAYOUT",r);return n?n.focus():window.location.href=e.target.href,!1}},"click a[data-group]":function(e){return this.toggleGroup(e.currentTarget.dataset.group),e.currentTarget.blur(),!1}}});return f.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting",loadedModules:{}},f.prototype.initialize=function(){e.defaults(this.options,f.DEFAULT_OPTIONS),this.activeModuleName="",this.navItems=null,this.$activeNavItem=null,this.lastSearchPhrase="",this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath))},f.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},f.prototype.afterRender=function(){this.broker.publish("navbar.render",{view:this}),this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries(),this.toggleGroups(),this.broker.publish("navbar.rendered",{view:this})},f.prototype.activateNavItem=function(e){e!==this.activeModuleName&&(this.activeModuleName=e,this.selectActiveNavItem())},f.prototype.changeLocale=function(e){t.reload(e)},f.prototype.setConnectionStatus=function(e){if(this.isRendered()){var t=this.$(".navbar-account-status");t.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),t.addClass(this.options[e+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===e)}},f.prototype.getModuleNameFromLi=function(e,t,a){var s=e.dataset[a?"clientModule":"module"];if(void 0===s&&!t)return"";if(s)return s;var i=e.querySelector("a");if(!i)return"";var r=i.getAttribute("href");return r?this.getModuleNameFromPath(r):""},f.prototype.getModuleNameFromPath=function(e){if("/"!==e[0]&&"#"!==e[0]||(e=e.substr(1)),""===e)return"";var t=e.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return t?t[1]:null},f.prototype.selectActiveNavItem=function(){if(this.isRendered()){null===this.navItems&&this.cacheNavItems();var e=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(e);var t=this.navItems[this.activeModuleName];!t&&i.currentPage&&i.currentPage.navbarModuleName&&(t=this.navItems[i.currentPage.navbarModuleName]),t?(t.addClass(e),this.$activeNavItem=t):this.$activeNavItem=null}},f.prototype.cacheNavItems=function(){this.navItems={},this.$(".nav > li").each(this.cacheNavItem.bind(this))},f.prototype.cacheNavItem=function(e,t){var a=this.$(t);a.hasClass(this.options.activeItemClassName)&&(this.$activeNavItem=a);var s=a.find("a").attr("href");if(s&&"#"===s[0]){var i=this.getModuleNameFromLi(a[0],!0,!0).split(" ")[0];this.navItems[i]=a}else if(a.hasClass("dropdown")){var r=this;a.find(".dropdown-menu > li").each(function(){var e=r.getModuleNameFromLi(this,!0,!0).split(" ")[0];r.navItems[e]=a})}},f.prototype.hideNotAllowedEntries=function(){var t=this,s=a.isLoggedIn(),i=[],r=[];function n(e){return e.hasClass("divider")?(r.push(e),!0):!!e.hasClass("dropdown-header")&&(i.push(e),!0)}function o(i){if(window.NAVBAR_ITEMS&&!1===window.NAVBAR_ITEMS[i.attr("data-item")])return!1;var r=i.attr("data-loggedin");if("string"==typeof r&&(r="0"!==r)!==s)return!1;var n=t.getModuleNameFromLi(i[0],!1);if(""!==n&&void 0===i.attr("data-no-module")&&e.some(n.split(" "),function(e){return!t.options.loadedModules[e]}))return!1;var o=i.attr("data-privilege");return void 0===o||a.isAllowedTo.apply(a,o.split(" "))}this.$(".navbar-nav > li").each(function(){var e=t.$(this);n(e)||(e[0].style.display=o(e)&&function e(t){if(!t.hasClass("dropdown"))return!0;var a=!0;t.find("> .dropdown-menu > li").each(function(){var s=t.find(this);if(!n(s)){var i=o(s)&&e(s);s[0].style.display=i?"":"none",a=a||i}});return a}(e)?"":"none")}),i.forEach(function(e){e[0].style.display=t.hasVisibleSiblings(e,"next")?"":"none"}),r.forEach(function(e){e[0].style.display=t.hasVisibleSiblings(e,"prev")&&t.hasVisibleSiblings(e,"next")?"":"none"}),this.$(".btn[data-privilege]").each(function(){this.style.display=a.isAllowedTo.apply(a,this.dataset.privilege.split(" "))?"":"none"})},f.prototype.hasVisibleSiblings=function(e,t){var a=e[t+"All"]().filter(function(){return"none"!==this.style.display});return!!a.length&&!a.first().hasClass("divider")},f.prototype.hideEmptyEntries=function(){var e=this;this.$(".dropdown > .dropdown-menu").each(function(){var t=e.$(this),a=!1;t.children().each(function(){a=a||"none"!==this.style.display}),a||(t.parent()[0].style.display="none")})},f.prototype.toggleConnectionStatusEntries=function(e){var t=this;this.$("li[data-online]").each(function(){var a=t.$(this);if(void 0!==a.attr("data-disabled"))return a.addClass("disabled");switch(a.attr("data-online")){case"show":a[0].style.display=e?"":"none";break;case"hide":a[0].style.display=e?"none":"";break;default:a[e?"removeClass":"addClass"]("disabled")}})},f.prototype.handleSearch=function(){var e=this.$id("searchPhrase").val().trim();if(e!==this.lastSearchPhrase){var t=this.parseSearchPhrase(e);this.$id("searchResults").replaceWith(this.renderSearchResults(t));var a=this.$id("searchResults").children().last();a.hasClass("divider")&&a.remove(),this.lastSearchPhrase=e,t.searchName&&this.scheduleUserSearch(t.searchName)}this.showNoSearchResults(e),this.showSearchResults()},f.prototype.showNoSearchResults=function(e){this.$(".navbar-search-result").length||this.$id("searchResults").html('<li class="disabled"><a>'+this.t("NAVBAR:SEARCH:"+(""===e?"help":"empty"))+"</a></li>")},f.prototype.showSearchResults=function(){var e=this.$id("search");e.find(".active").removeClass("active"),e.find(".navbar-search-result").first().addClass("active"),e.addClass("open")},f.prototype.hideSearchResults=function(){this.$id("search").removeClass("open").find(".active").removeClass("active"),document.activeElement===this.$id("searchPhrase")[0]&&this.$id("searchPhrase").blur()},f.prototype.selectPrevSearchResult=function(){var e=this.$(".navbar-search-result");if(e.length){for(var t=e.filter(".active").removeClass("active"),a=e.length-1;a>=0;--a){if(e[a]===t[0])break}(t=0===a?e.last():e.eq(a-1)).addClass("active")}},f.prototype.selectNextSearchResult=function(){var e=this.$(".navbar-search-result");if(e.length){for(var t=e.filter(".active").removeClass("active"),a=0;a<e.length;++a){if(e[a]===t[0])break}(t=a===e.length-1?e.first():e.eq(a+1)).addClass("active")}},f.prototype.selectActiveSearchResult=function(){var e,t,a=this,s=a.$id("searchResults").find(".active").find("a"),i=s.prop("target"),r=s.prop("href");r&&("_blank"!==i?(e=a.broker.subscribe("viewport.page.shown",function(){e.cancel(),t.cancel(),a.hideSearchResults()}),t=a.broker.subscribe("viewport.page.loadingFailed",function(){e.cancel(),t.cancel()}),window.location.href=r):window.open(r,i))},f.prototype.renderSearchResults=function(e){return this.renderPartial(d,{results:e})},f.prototype.parseSearchPhrase=function(e){var t,a={fullOrderNo:null,partialOrderNo:null,fullNc12:null,partialNc12:null,fullNc15:null,entryId:null,year:null,month:null,day:null,shift:null,from:null,to:null,fromShift:null,toShift:null,shiftStart:null,shiftEnd:null,division:null,searchName:null};e=" "+e.toUpperCase()+" ",Object.keys(p).forEach(function(t){var s=e.indexOf(t);-1!==s&&" "===e.substr(s+t.length,1)&&(a.division=p[t],e=e.replace(t,""))}),(t=e.match(/[^0-9A-Z]([0-9]{15})[^0-9A-Z]/))&&(a.fullNc15=t[1],e=e.replace(a.fullNc15,"")),(t=e.match(/[^0-9A-Z]([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})[^0-9A-Z]/))&&(12===t[1].length||/[0-9]+/.test(t[1]))&&(a.fullNc12=t[1].toUpperCase(),e=e.replace(/([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})/g,"")),(t=e.match(/[^0-9](1[0-9]{8})[^0-9]/))&&(a.fullOrderNo=t[1],/^1111/.test(t[1])&&(a.partialNc12=t[1]),e=e.replace(/(1[0-9]{8})/g,"")),(t=e.match(/[^A-Z0-9](I{1,3})[^A-Z0-9]/))&&(a.shift="I"===t[1].toUpperCase()?1:"II"===t[1].toUpperCase()?2:3,e=e.replace(/I{1,3}/g,""));var i=null,r="days";return(t=e.match(/[^0-9]([0-9]{1,4})[^0-9]([0-9]{1,4})(?:[^0-9]([0-9]{1,4}))?[^0-9]/))&&(a.month=+t[2],4===t[1].length?(r="months",a.year=+t[1],a.day=+t[3]||1):t[3]||4!==t[2].length?t[3]&&4===t[3].length?(a.day=+t[1],a.year=+t[3]):t[3]?(a.day=+t[1],a.year=parseInt(t[3],10)+2e3):(a.day=+t[1],a.year=+s.format(Date.now(),"YYYY")):(r="months",a.year=+t[2],a.month=+t[1],a.day=1),e=e.replace(/[0-9]{1,4}[^0-9][0-9]{1,4}([^0-9][0-9]{1,4})?/g,""),i=s.getMoment(a.year+"-"+a.month+"-"+a.day,"YYYY-MM-DD")),!i&&a.shift&&(i=s.getMoment(Date.now()).startOf("day"),a.year=i.year(),a.month=i.month(),a.day=i.day()),i&&i.isValid()?(a.from=i.valueOf(),a.fromShift=i.hours(6).valueOf(),a.shiftStart=a.fromShift+288e5*((a.shift||1)-1),a.toShift=i.add(1,r).valueOf(),a.shiftEnd=a.shift?a.shiftStart+288e5:a.toShift,a.to=i.startOf("day").valueOf()):(a.year=null,a.month=null,a.day=null),t=c.transliterate(e).match(/([A-Z]{3,})/),!a.division&&t&&(a.searchName=t[1]),(t=e.match(/([0-9]+)/))&&(/^1[0-9]*$/.test(t[1])&&t[1].length<9&&(a.partialOrderNo=t[1]),/^[0-9]{1,6}$/.test(t[1])&&(a.entryId=t[1]),t[1].length<12&&(a.partialNc12=t[1].toUpperCase())),a.fullOrderNo&&a.partialOrderNo&&(a.partialOrderNo=null),a.fullNc12&&a.partialNc12&&(a.partialNc12=null),a},f.prototype.showMor=function(){if("mor"!==i.currentPage.pageId){var e=this.$id("mor").addClass("disabled");e.find(".fa").removeClass("fa-group").addClass("fa-spinner fa-spin");var t=new h({model:new l});t.model.fetch().done(function(){i.showDialog(t)}).always(function(){e.removeClass("disabled").find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-group")})}},f.prototype.scheduleUserSearch=function(e){this.timers.searchUsers&&clearTimeout(this.timers.searchUsers),this.timers.searchUsers=setTimeout(this.searchUsers.bind(this,e),300)},f.prototype.searchUsers=function(e){var t=this;t.searchUsersReq&&t.searchUsersReq.abort();var a=t.searchUsersReq=this.ajax({url:"/users?limit(20)&searchName=regex="+encodeURIComponent("^"+e)});a.done(function(a){var s=t.$id("searchName"),i=s.next().detach();i.removeClass("active").find(".fa").remove();var r=c.filterDuplicates(a.collection);if(0===r.length)return s.remove(),void t.showNoSearchResults(e);r.slice(0,5).reverse().forEach(function(e){var t=i.clone(),a=e.lastName||e.firstName?(e.lastName+" "+e.firstName).trim():e.login;t.find("a").attr("href","#users/"+e._id).text(a),t.insertAfter(s)}),s.next().addClass("active").focus()}),a.fail(function(){t.$id("searchName").find(".fa-spin").removeClass(".fa-spin")}),a.always(function(){a===t.searchUsersReq&&(t.searchUsersReq=null)})},f.prototype.toggleGroups=function(){var t=this,s=JSON.parse(n.getItem("WMES_NAVBAR_GROUPS")||"{}"),i={};t.$("a[data-group]").each(function(){var e=this.dataset.group.split("/")[0];i[e]||(i[e]=[]),!this.dataset.privilege||a.isAllowedTo.apply(a,this.dataset.privilege.split(" "))?(i[e].push(this.dataset.group),s[e]||(s[e]=this.dataset.group)):this.parentNode.removeChild(this)}),Object.keys(s).forEach(function(a){var r=i[a];e.isEmpty(r)||(s[a]&&-1!==r.indexOf(s[a])||(s[a]=r[0]),t.toggleGroup(s[a]))})},f.prototype.toggleGroup=function(e){var t=e.split("/");this.$('a[data-group^="'+t[0]+'"]').each(function(){this.classList.toggle("active",this.dataset.group===e)}),this.$('li[data-group^="'+t[0]+'"]').each(function(){this.classList.toggle("navbar-group-hidden",this.dataset.group!==e)});var a=JSON.parse(n.getItem("WMES_NAVBAR_GROUPS")||"{}");a[t[0]]=e,n.setItem("WMES_NAVBAR_GROUPS",JSON.stringify(a))},f.prototype.collapse=function(){this.$(".navbar-collapse.in").length&&this.$(".navbar-toggle").click()},f});