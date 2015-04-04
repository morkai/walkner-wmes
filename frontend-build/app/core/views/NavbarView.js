// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/user","../View","app/core/templates/navbar"],function(t,e,i,a,n){"use strict";var s=a.extend({template:n,localTopics:{"router.executing":function(t){this.activateNavItem(this.getModuleNameFromPath(t.req.path))},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")}},events:{"click .disabled a":function(t){t.preventDefault()},"click .navbar-account-locale":function(t){t.preventDefault(),this.changeLocale(t.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(t){t.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(t){t.preventDefault(),this.trigger("logOut")},"click .navbar-feedback":function(t){t.preventDefault(),t.target.disabled=!0,this.trigger("feedback",function(){t.target.disabled=!1})}}});return s.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting",loadedModules:[]},s.prototype.initialize=function(){t.defaults(this.options,s.DEFAULT_OPTIONS),this.activeModuleName="",this.navItems=null,this.$activeNavItem=null,this.loadedModules={},this.options.loadedModules.forEach(function(t){this.loadedModules[t]=!0},this),this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath))},s.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},s.prototype.afterRender=function(){this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries()},s.prototype.serialize=function(){return{user:i}},s.prototype.activateNavItem=function(t){t!==this.activeModuleName&&(this.activeModuleName=t,this.selectActiveNavItem())},s.prototype.changeLocale=function(t){e.reload(t)},s.prototype.setConnectionStatus=function(t){if(this.isRendered()){var e=this.$(".navbar-account-status");e.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),e.addClass(this.options[t+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===t)}},s.prototype.getModuleNameFromLi=function(t,e){if(void 0===t.dataset.module&&!e)return null;if(t.dataset.module)return t.dataset.module;var i=t.querySelector("a");if(!i)return null;var a=i.getAttribute("href");return a?this.getModuleNameFromPath(a):null},s.prototype.getModuleNameFromPath=function(t){if(("/"===t[0]||"#"===t[0])&&(t=t.substr(1)),""===t)return"";var e=t.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return e?e[1]:null},s.prototype.selectActiveNavItem=function(){if(this.isRendered()){null===this.navItems&&this.cacheNavItems();var e=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(e);var i=this.navItems[this.activeModuleName];t.isUndefined(i)?this.$activeNavItem=null:(i.addClass(e),this.$activeNavItem=i)}},s.prototype.cacheNavItems=function(){this.navItems={},this.$(".nav > li").each(this.cacheNavItem.bind(this))},s.prototype.cacheNavItem=function(t,e){var i=this.$(e);i.hasClass(this.options.activeItemClassName)&&(this.$activeNavItem=i);var a=i.find("a").attr("href");if(a&&"#"===a[0]){var n=this.getModuleNameFromLi(i[0],!0);this.navItems[n]=i}else if(i.hasClass("dropdown")){var s=this;i.find(".dropdown-menu > li").each(function(){var t=s.getModuleNameFromLi(this,!0);s.navItems[t]=i})}},s.prototype.hideNotAllowedEntries=function(){function t(i){if(!i.hasClass("dropdown"))return!0;var n=!0;return i.find("> .dropdown-menu > li").each(function(){var s=i.find(this);if(!e(s)){var o=a(s)&&t(s);s.toggle(o),n=n||o}}),n}function e(t){return t.hasClass("divider")?(r.push(t),!0):t.hasClass("dropdown-header")?(o.push(t),!0):!1}function a(t){var e=t.attr("data-loggedin");if("string"==typeof e&&(e="0"!==e,e!==s))return!1;var a=n.getModuleNameFromLi(t[0],!1);if(null!==a&&!n.loadedModules[a])return!1;var o=t.attr("data-privilege");return void 0===o||i.isAllowedTo.apply(i,o.split(" "))}var n=this,s=i.isLoggedIn(),o=[],r=[];this.$(".navbar-nav > li").each(function(){var i=n.$(this);e(i)||i.toggle(a(i)&&t(i))}),o.forEach(function(t){t.toggle(this.hasVisibleSiblings(t,"next"))},this),r.forEach(function(t){t.toggle(this.hasVisibleSiblings(t,"prev")&&this.hasVisibleSiblings(t,"next"))},this)},s.prototype.hasVisibleSiblings=function(t,e){var i=t[e+"All"]().filter(function(){return"none"!==this.style.display});if(!i.length)return!1;var a=i.first();return!a.hasClass("divider")},s.prototype.hideEmptyEntries=function(){var t=this;this.$(".dropdown > .dropdown-menu").each(function(){var e=t.$(this),i=!1;e.children().each(function(){i=i||"none"!==this.style.display}),i||e.parent().hide()})},s.prototype.toggleConnectionStatusEntries=function(t){var e=this;this.$("li[data-online]").each(function(){var i=e.$(this);if("undefined"!=typeof i.attr("data-disabled"))return i.addClass("disabled");switch(i.attr("data-online")){case"show":i[t?"show":"hide"]();break;case"hide":i[t?"hide":"show"]();break;default:i[t?"removeClass":"addClass"]("disabled")}})},s});