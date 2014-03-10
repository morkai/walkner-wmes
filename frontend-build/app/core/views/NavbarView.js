define(["jquery","underscore","app/i18n","app/user","../View","app/core/templates/navbar"],function(t,e,a,i,n,s){var o=n.extend({template:s,localTopics:{"router.executing":function(t){this.activateNavItem(this.getModuleNameFromPath(t.req.path))},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")}},events:{"click .disabled a":function(t){t.preventDefault()},"click .navbar-account-locale":function(t){t.preventDefault(),this.changeLocale(t.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(t){t.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(t){t.preventDefault(),this.trigger("logOut")},"click .navbar-feedback":function(t){t.preventDefault(),t.target.disabled=!0,this.trigger("feedback",function(){t.target.disabled=!1})}}});return o.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting"},o.prototype.initialize=function(){e.defaults(this.options,o.DEFAULT_OPTIONS),this.activeModuleName="",this.navItems=null,this.$activeNavItem=null,this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath))},o.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},o.prototype.afterRender=function(){this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries()},o.prototype.serialize=function(){return{user:i}},o.prototype.activateNavItem=function(t){t!==this.activeModuleName&&(this.activeModuleName=t,this.selectActiveNavItem())},o.prototype.changeLocale=function(t){a.reload(t)},o.prototype.setConnectionStatus=function(t){if(this.isRendered()){var e=this.$(".navbar-account-status");e.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),e.addClass(this.options[t+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===t)}},o.prototype.getModuleNameFromPath=function(t){if("/"===t[0]&&(t=t.substr(1)),""===t)return"";var e=t.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return e?e[1]:null},o.prototype.selectActiveNavItem=function(){if(this.isRendered()){null===this.navItems&&this.cacheNavItems();var t=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(t);var a=this.navItems[this.activeModuleName];e.isUndefined(a)?this.$activeNavItem=null:(a.addClass(t),this.$activeNavItem=a)}},o.prototype.cacheNavItems=function(){this.navItems={},this.$(".nav > li").each(this.cacheNavItem.bind(this))},o.prototype.cacheNavItem=function(t,e){var a=this.$(e);a.hasClass(this.options.activeItemClassName)&&(this.$activeNavItem=a);var i=a.find("a").attr("href");if(i&&"#"===i[0]){var n=this.getModuleNameFromPath(i.substr(1));this.navItems[n]=a}else if(a.hasClass("dropdown")){var s=this;a.find(".dropdown-menu > li > a").each(function(){var t=this.getAttribute("href");if(t&&"#"===t[0]){var e=s.getModuleNameFromPath(t.substr(1));s.navItems[e]=a}})}},o.prototype.hideNotAllowedEntries=function(){var t=this;this.$("li[data-privilege]").each(function(){var e=t.$(this),a=e.attr("data-privilege").split(" ");e[i.isAllowedTo(a)?"show":"hide"]()}),this.$("li[data-loggedin]").each(function(){var e=t.$(this),a=e.attr("data-loggedin"),n="false"===a?!i.isLoggedIn():i.isLoggedIn();e[n?"show":"hide"]()})},o.prototype.hideEmptyEntries=function(){this.$(".dropdown > .dropdown-menu").each(function(){var e=t(this),a=!1;e.children().each(function(){a=a||"none"!==this.style.display}),e.parent().toggle(a)})},o.prototype.toggleConnectionStatusEntries=function(t){var e=this;this.$("li[data-online]").each(function(){var a=e.$(this);if("undefined"!=typeof a.attr("data-disabled"))return a.addClass("disabled");switch(a.attr("data-online")){case"show":a[t?"show":"hide"]();break;case"hide":a[t?"hide":"show"]();break;default:a[t?"removeClass":"addClass"]("disabled")}})},o});