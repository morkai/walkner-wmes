define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(a){return String(a).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      ',user.getLabel(),'\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online><a href="#users/',user.data._id,'">',t("core","NAVBAR:MY_ACCOUNT"),'</a>\n      <li class="divider">\n      <li class="dropdown-header">',t("core","NAVBAR:UI_LOCALE"),'\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">',t("core","NAVBAR:LOCALE_PL"),'</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">',t("core","NAVBAR:LOCALE_US"),'</a>\n      <li class="divider">\n      <li data-loggedin="false"><a class="navbar-account-logIn" href="#login">',t("core","NAVBAR:LOG_IN"),'</a>\n      <li data-loggedin><a class="navbar-account-logOut" href="/logout">',t("core","NAVBAR:LOG_OUT"),'</a>\n    </ul>\n  </li>\n</ul>\n<button class="btn btn-warning navbar-btn navbar-right navbar-feedback" type="button" title="',t("core","feedback:button:tooltip"),'">',t("core","feedback:button:text"),"</button>\n")}();return buf.join("")}});