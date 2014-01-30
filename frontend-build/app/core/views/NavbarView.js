define(["jquery","underscore","app/i18n","app/user","../View","app/core/templates/navbar","i18n!app/nls/core"],function(e,t,i,n,o,r){var s=o.extend({template:r,localTopics:{"router.executing":function(e){this.activateNavItem(this.getModuleNameFromPath(e.req.path))},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")}},events:{"click .disabled a":function(e){e.preventDefault()},"click .navbar-account-locale":function(e){e.preventDefault(),this.changeLocale(e.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(e){e.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(e){e.preventDefault(),this.trigger("logOut")}}});return s.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting"},s.prototype.initialize=function(){t.defaults(this.options,s.DEFAULT_OPTIONS),this.activeModuleName="",this.navItems=null,this.$activeNavItem=null,this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath))},s.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},s.prototype.afterRender=function(){this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries()},s.prototype.serialize=function(){return{user:n}},s.prototype.activateNavItem=function(e){e!==this.activeModuleName&&(this.activeModuleName=e,this.selectActiveNavItem())},s.prototype.changeLocale=function(e){i.reload(e)},s.prototype.setConnectionStatus=function(e){if(this.isRendered()){var t=this.$(".navbar-account-status");t.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),t.addClass(this.options[e+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===e)}},s.prototype.getModuleNameFromPath=function(e){if("/"===e[0]&&(e=e.substr(1)),""===e)return"";var t=e.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return t?t[1]:null},s.prototype.selectActiveNavItem=function(){if(this.isRendered()){null===this.navItems&&this.cacheNavItems();var e=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(e);var i=this.navItems[this.activeModuleName];t.isUndefined(i)?this.$activeNavItem=null:(i.addClass(e),this.$activeNavItem=i)}},s.prototype.cacheNavItems=function(){this.navItems={},this.$(".nav > li").each(this.cacheNavItem.bind(this))},s.prototype.cacheNavItem=function(e,t){var i=this.$(t);i.hasClass(this.options.activeItemClassName)&&(this.$activeNavItem=i);var n=i.find("a").attr("href");if(n&&"#"===n[0]){var o=this.getModuleNameFromPath(n.substr(1));this.navItems[o]=i}else if(i.hasClass("dropdown")){var r=this;i.find(".dropdown-menu > li > a").each(function(){var e=this.getAttribute("href");if(e&&"#"===e[0]){var t=r.getModuleNameFromPath(e.substr(1));r.navItems[t]=i}})}},s.prototype.hideNotAllowedEntries=function(){var e=this;this.$("li[data-privilege]").each(function(){var t=e.$(this),i=t.attr("data-privilege").split(" ");t[n.isAllowedTo(i)?"show":"hide"]()}),this.$("li[data-loggedin]").each(function(){var t=e.$(this),i=t.attr("data-loggedin"),o="false"===i?!n.isLoggedIn():n.isLoggedIn();t[o?"show":"hide"]()})},s.prototype.hideEmptyEntries=function(){this.$(".dropdown > .dropdown-menu").each(function(){var t=e(this),i=!1;t.children().each(function(){i=i||"none"!==this.style.display}),t.parent().toggle(i)})},s.prototype.toggleConnectionStatusEntries=function(e){var t=this;this.$("li[data-online]").each(function(){var i=t.$(this);if("undefined"!=typeof i.attr("data-disabled"))return i.addClass("disabled");switch(i.attr("data-online")){case"show":i[e?"show":"hide"]();break;case"hide":i[e?"hide":"show"]();break;default:i[e?"removeClass":"addClass"]("disabled")}})},s});