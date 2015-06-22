define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="navbar-inner">\n  '),function(){__output.push('<div class="navbar-header">\n  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n    <span class="sr-only">'),__output.push(t("core","NAVBAR:TOGGLE")),__output.push('</span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n  </button>\n  <a class="navbar-brand fa fa-cogs" href="#"></a>\n</div>\n')}(),__output.push('\n  <div class="collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li><a href="#">'),__output.push(t("core","NAVBAR:DASHBOARD")),__output.push('</a>\n      <li data-online data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__output.push(t("core","NAVBAR:EVENTS")),__output.push('</a>\n      <li data-online data-loggedin class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          '),__output.push(t("core","NAVBAR:KAIZEN")),__output.push('\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li class="dropdown-header">'),__output.push(t("core","NAVBAR:KAIZEN:ORDERS")),__output.push('\n          <li data-module><a href="#kaizen/orders">'),__output.push(t("core","NAVBAR:KAIZEN:ALL")),__output.push('</a>\n          <li data-module><a href="#kaizen/orders?observers.user.id=mine&sort(-createdAt)&limit(15)">'),__output.push(t("core","NAVBAR:KAIZEN:MINE")),__output.push('</a>\n          <li data-module><a href="#kaizen/orders?observers.user.id=unseen&sort(-createdAt)&limit(15)">'),__output.push(t("core","NAVBAR:KAIZEN:UNSEEN")),__output.push('</a>\n          <li class="divider">\n          <li class="dropdown-header">'),__output.push(t("core","NAVBAR:KAIZEN:DICTIONARIES")),__output.push('\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/sections">'),__output.push(t("core","NAVBAR:KAIZEN:SECTIONS")),__output.push('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/areas">'),__output.push(t("core","NAVBAR:KAIZEN:AREAS")),__output.push('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/categories">'),__output.push(t("core","NAVBAR:KAIZEN:CATEGORIES")),__output.push('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/causes">'),__output.push(t("core","NAVBAR:KAIZEN:CAUSES")),__output.push('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/risks">'),__output.push(t("core","NAVBAR:KAIZEN:RISKS")),__output.push('</a>\n        </ul>\n      <li data-online class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          '),__output.push(t("core","NAVBAR:DICTIONARIES")),__output.push('\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__output.push(t("core","NAVBAR:USERS")),__output.push('</a>\n          <li class="divider">\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">'),__output.push(t("core","NAVBAR:COMPANIES")),__output.push('</a>\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">'),__output.push(t("core","NAVBAR:PROD_FUNCTIONS")),__output.push('</a>\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">'),__output.push(t("core","NAVBAR:DIVISIONS")),__output.push('</a>\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">'),__output.push(t("core","NAVBAR:SUBDIVISIONS")),__output.push("</a>\n        </ul>\n    </ul>\n    "),function(){__output.push('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      '),__output.push(user.getLabel()),__output.push('\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online data-loggedin><a href="#users/'),__output.push(user.data._id),__output.push('">'),__output.push(t("core","NAVBAR:MY_ACCOUNT")),__output.push('</a>\n      <li class="divider">\n      <li class="dropdown-header">'),__output.push(t("core","NAVBAR:UI_LOCALE")),__output.push('\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">'),__output.push(t("core","NAVBAR:LOCALE_PL")),__output.push('</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">'),__output.push(t("core","NAVBAR:LOCALE_US")),__output.push('</a>\n      <li class="divider">\n      <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__output.push(t("core","NAVBAR:LOG_IN")),__output.push('</a>\n      <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__output.push(t("core","NAVBAR:LOG_OUT")),__output.push('</a>\n    </ul>\n  </li>\n</ul>\n<!--\n<button class="btn btn-warning navbar-btn navbar-right navbar-feedback" type="button" title="'),__output.push(t("core","feedback:button:tooltip")),__output.push('">'),__output.push(t("core","feedback:button:text")),__output.push("</button>\n//-->\n")}(),__output.push("\n  </div>\n</div>\n");return __output.join("")}});