// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","app/time","app/viewport","app/data/orgUnits","../View","app/mor/Mor","app/mor/views/MorView","app/core/templates/navbar","app/core/templates/navbar/searchResults"],function(e,t,a,i,s,n,r,o,l,c,h){"use strict";var u={};n.getAllByType("division").forEach(function(e){u[e.id.replace(/[^A-Za-z0-9]/g,"").toUpperCase()]=e.id});var d=r.extend({template:c,localTopics:{"router.executing":function(e){this.activateNavItem(this.getModuleNameFromPath(e.req.path))},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")}},events:{"click .disabled a":function(e){e.preventDefault()},"click .navbar-account-locale":function(e){e.preventDefault(),this.changeLocale(e.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(e){e.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(e){e.preventDefault(),this.trigger("logOut")},"click .navbar-feedback":function(e){e.preventDefault(),e.target.disabled=!0,this.trigger("feedback",function(){e.target.disabled=!1})},"mouseup .btn[data-href]":function(e){if(2!==e.button){var t=e.currentTarget.dataset.href;return e.ctrlKey||1===e.button?window.open(t):window.location.href=t,document.body.click(),!1}},"submit #-search":function(){return!1},"focus #-searchPhrase":function(){clearTimeout(this.timers.hideSearchResults),this.handleSearch()},"blur #-searchPhrase":function(){clearTimeout(this.timers.hideSearchResults),this.timers.hideSearchResults=setTimeout(this.hideSearchResults.bind(this),250)},"keydown #-searchPhrase":function(e){return 13===e.keyCode?(this.selectActiveSearchResult(),!1):38===e.keyCode?(this.selectPrevSearchResult(),!1):40===e.keyCode?(this.selectNextSearchResult(),!1):void 0},"keyup #-searchPhrase":function(e){return 13!==e.keyCode&&38!==e.keyCode&&40!==e.keyCode&&(27===e.keyCode?(e.target.value="",this.handleSearch(),!1):e.target.value.length<=1?void this.handleSearch():(this.timers.handleSearch&&clearTimeout(this.timers.handleSearch),void(this.timers.handleSearch=setTimeout(this.handleSearch.bind(this),1e3/30))))},"mouseup #-mor":function(e){if(!e.ctrlKey&&0===e.button)return this.showMor(),!1},"click #-mor":function(e){if(!e.ctrlKey&&0===e.button)return!1}}});return d.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting",loadedModules:{}},d.prototype.initialize=function(){e.defaults(this.options,d.DEFAULT_OPTIONS),this.activeModuleName="",this.navItems=null,this.$activeNavItem=null,this.lastSearchPhrase="",this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath))},d.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},d.prototype.afterRender=function(){this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries()},d.prototype.serialize=function(){return{idPrefix:this.idPrefix,user:a}},d.prototype.activateNavItem=function(e){e!==this.activeModuleName&&(this.activeModuleName=e,this.selectActiveNavItem())},d.prototype.changeLocale=function(e){t.reload(e)},d.prototype.setConnectionStatus=function(e){if(this.isRendered()){var t=this.$(".navbar-account-status");t.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),t.addClass(this.options[e+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===e)}},d.prototype.getModuleNameFromLi=function(e,t,a){var i=e.dataset[a?"clientModule":"module"];if(void 0===i&&!t)return null;if(i)return i;var s=e.querySelector("a");if(!s)return null;var n=s.getAttribute("href");return n?this.getModuleNameFromPath(n):null},d.prototype.getModuleNameFromPath=function(e){if("/"!==e[0]&&"#"!==e[0]||(e=e.substr(1)),""===e)return"";var t=e.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return t?t[1]:null},d.prototype.selectActiveNavItem=function(){if(this.isRendered()){null===this.navItems&&this.cacheNavItems();var t=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(t);var a=this.navItems[this.activeModuleName];e.isUndefined(a)?this.$activeNavItem=null:(a.addClass(t),this.$activeNavItem=a)}},d.prototype.cacheNavItems=function(){this.navItems={},this.$(".nav > li").each(this.cacheNavItem.bind(this))},d.prototype.cacheNavItem=function(e,t){var a=this.$(t);a.hasClass(this.options.activeItemClassName)&&(this.$activeNavItem=a);var i=a.find("a").attr("href");if(i&&"#"===i[0]){var s=this.getModuleNameFromLi(a[0],!0,!0);this.navItems[s]=a}else if(a.hasClass("dropdown")){var n=this;a.find(".dropdown-menu > li").each(function(){var e=n.getModuleNameFromLi(this,!0,!0);n.navItems[e]=a})}},d.prototype.hideNotAllowedEntries=function(){function e(a){if(!a.hasClass("dropdown"))return!0;var s=!0;return a.find("> .dropdown-menu > li").each(function(){var n=a.find(this);if(!t(n)){var r=i(n)&&e(n);n[0].style.display=r?"":"none",s=s||r}}),s}function t(e){return e.hasClass("divider")?(o.push(e),!0):!!e.hasClass("dropdown-header")&&(r.push(e),!0)}function i(e){var t=e.attr("data-loggedin");if("string"==typeof t&&(t="0"!==t)!==n)return!1;var i=s.getModuleNameFromLi(e[0],!1);if(null!==i&&void 0===e.attr("data-no-module")&&!s.options.loadedModules[i])return!1;var r=e.attr("data-privilege");return void 0===r||a.isAllowedTo.apply(a,r.split(" "))}var s=this,n=a.isLoggedIn(),r=[],o=[];this.$(".navbar-nav > li").each(function(){var a=s.$(this);t(a)||(a[0].style.display=i(a)&&e(a)?"":"none")}),r.forEach(function(e){e[0].style.display=s.hasVisibleSiblings(e,"next")?"":"none"}),o.forEach(function(e){e[0].style.display=s.hasVisibleSiblings(e,"prev")&&s.hasVisibleSiblings(e,"next")?"":"none"}),this.$(".btn[data-privilege]").each(function(){this.style.display=a.isAllowedTo.apply(a,this.dataset.privilege.split(" "))?"":"none"})},d.prototype.hasVisibleSiblings=function(e,t){var a=e[t+"All"]().filter(function(){return"none"!==this.style.display});return!!a.length&&!a.first().hasClass("divider")},d.prototype.hideEmptyEntries=function(){var e=this;this.$(".dropdown > .dropdown-menu").each(function(){var t=e.$(this),a=!1;t.children().each(function(){a=a||"none"!==this.style.display}),a||(t.parent()[0].style.display="none")})},d.prototype.toggleConnectionStatusEntries=function(e){var t=this;this.$("li[data-online]").each(function(){var a=t.$(this);if(void 0!==a.attr("data-disabled"))return a.addClass("disabled");switch(a.attr("data-online")){case"show":a[0].style.display=e?"":"none";break;case"hide":a[0].style.display=e?"none":"";break;default:a[e?"removeClass":"addClass"]("disabled")}})},d.prototype.handleSearch=function(){var e=this.$id("searchPhrase"),a=e.val().trim();if(a!==this.lastSearchPhrase){var i=this.parseSearchPhrase(a);this.$id("searchResults").replaceWith(h({idPrefix:this.idPrefix,results:i}));var s=this.$id("searchResults").children().last();s.hasClass("divider")&&s.remove(),this.lastSearchPhrase=a}this.$(".navbar-search-result").length||this.$id("searchResults").html('<li class="disabled"><a>'+t("core","NAVBAR:SEARCH:"+(""===a?"help":"empty"))+"</a></li>"),this.showSearchResults()},d.prototype.showSearchResults=function(){var e=this.$id("search");e.find(".active").removeClass("active"),e.find(".navbar-search-result").first().addClass("active"),e.addClass("open")},d.prototype.hideSearchResults=function(){this.$id("search").removeClass("open").find(".active").removeClass("active"),document.activeElement===this.$id("searchPhrase")[0]&&this.$id("searchPhrase").blur()},d.prototype.selectPrevSearchResult=function(){var e=this.$(".navbar-search-result");if(e.length){for(var t=e.filter(".active").removeClass("active"),a=e.length-1;a>=0;--a){if(e[a]===t[0])break}t=0===a?e.last():e.eq(a-1),t.addClass("active")}},d.prototype.selectNextSearchResult=function(){var e=this.$(".navbar-search-result");if(e.length){for(var t=e.filter(".active").removeClass("active"),a=0;a<e.length;++a){if(e[a]===t[0])break}t=a===e.length-1?e.first():e.eq(a+1),t.addClass("active")}},d.prototype.selectActiveSearchResult=function(){var e=this,t=e.$id("searchResults").find(".active").find("a"),a=t.prop("target"),i=t.prop("href");if(i){if("_blank"===a)return void window.open(i,a);var s,n;s=e.broker.subscribe("viewport.page.shown",function(){s.cancel(),n.cancel(),e.hideSearchResults()}),n=e.broker.subscribe("viewport.page.loadingFailed",function(){s.cancel(),n.cancel()}),window.location.href=i}},d.prototype.parseSearchPhrase=function(e){var t,a={fullOrderNo:null,partialOrderNo:null,fullNc12:null,partialNc12:null,fullNc15:null,entryId:null,year:null,month:null,day:null,shift:null,from:null,to:null,fromShift:null,toShift:null,shiftStart:null,shiftEnd:null,division:null};e=" "+e.toUpperCase()+" ",Object.keys(u).forEach(function(t){-1!==e.indexOf(t)&&(a.division=u[t],e=e.replace(t,""))}),t=e.match(/[^0-9A-Z]([0-9]{15})[^0-9A-Z]/),t&&(a.fullNc15=t[1],e=e.replace(a.fullNc15,"")),t=e.match(/[^0-9A-Z]([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})[^0-9A-Z]/),t&&(a.fullNc12=t[1].toUpperCase(),e=e.replace(/([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})/g,"")),t=e.match(/[^0-9](1[0-9]{8})[^0-9]/),t&&(a.fullOrderNo=t[1],/^1111/.test(t[1])&&(a.partialNc12=t[1]),e=e.replace(/(1[0-9]{8})/g,"")),t=e.match(/[^A-Z0-9](I{1,3})[^A-Z0-9]/),t&&(a.shift="I"===t[1].toUpperCase()?1:"II"===t[1].toUpperCase()?2:3,e=e.replace(/I{1,3}/g,"")),t=e.match(/[^0-9]([0-9]{1,4})[^0-9]([0-9]{1,4})(?:[^0-9]([0-9]{1,4}))?[^0-9]/);var s=null,n="days";return t&&(a.month=+t[2],4===t[1].length?(n="months",a.year=+t[1],a.day=+t[3]||1):t[3]||4!==t[2].length?t[3]&&4===t[3].length?(a.day=+t[1],a.year=+t[3]):t[3]?(a.day=+t[1],a.year=parseInt(t[3],10)+2e3):(a.day=+t[1],a.year=+i.format(Date.now(),"YYYY")):(n="months",a.year=+t[2],a.month=+t[1],a.day=1),e=e.replace(/[0-9]{1,4}[^0-9][0-9]{1,4}([^0-9][0-9]{1,4})?/g,""),s=i.getMoment(a.year+"-"+a.month+"-"+a.day,"YYYY-MM-DD")),!s&&a.shift&&(s=i.getMoment(Date.now()).startOf("day"),a.year=s.year(),a.month=s.month(),a.day=s.day()),s&&s.isValid()?(a.from=s.valueOf(),a.fromShift=s.hours(6).valueOf(),a.shiftStart=a.fromShift+288e5*((a.shift||1)-1),a.toShift=s.add(1,n).valueOf(),a.shiftEnd=a.shift?a.shiftStart+288e5:a.toShift,a.to=s.startOf("day").valueOf()):(a.year=null,a.month=null,a.day=null),t=e.match(/([A-Z0-9]+)/),t&&(/^1[0-9]*$/.test(t[1])&&t[1].length<9&&(a.partialOrderNo=t[1]),/^[0-9]{1,6}$/.test(t[1])&&(a.entryId=t[1]),t[1].length<12&&(a.partialNc12=t[1].toUpperCase())),a.fullOrderNo&&a.partialOrderNo&&(a.partialOrderNo=null),a.fullNc12&&a.partialNc12&&(a.partialNc12=null),a},d.prototype.showMor=function(){if("mor"!==s.currentPage.pageId){var e=this.$id("mor").addClass("disabled");e.find(".fa").removeClass("fa-group").addClass("fa-spinner fa-spin");var t=new l({model:new o});t.model.fetch().done(function(){s.showDialog(t)}).always(function(){e.removeClass("disabled").find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-group")})}},d});