define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="navbar-inner">\n  '),function(){__append('<div class="navbar-header">\n  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n    <span class="sr-only">'),__append(t("core","NAVBAR:TOGGLE")),__append('</span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n  </button>\n  <a class="navbar-brand fa fa-cogs" href="#"></a>\n</div>\n')}.call(this),__append('\n  <div class="collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li data-online data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__append(t("core","NAVBAR:EVENTS")),__append('</a>\n      <li data-online data-loggedin class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          '),__append(t("suggestions","navbar:kaizen")),__append('\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-module="kaizen"><a href="#suggestions">'),__append(t("suggestions","navbar:all")),__append('</a>\n          <li data-module="kaizen"><a href="#suggestions?observers.user.id=mine&sort(-createdAt)&limit(20)">'),__append(t("suggestions","navbar:mine")),__append('</a>\n          <li data-module="kaizen"><a href="#suggestions?observers.user.id=unseen&sort(-createdAt)&limit(20)">'),__append(t("suggestions","navbar:unseen")),__append('</a>\n        </ul>\n      <li data-online data-loggedin data-module="kaizen"><a href="#kaizenReport">'),__append(t("suggestions","navbar:report")),__append('</a>\n      <li data-online class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          '),__append(t("core","NAVBAR:DICTIONARIES")),__append('\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__append(t("core","NAVBAR:USERS")),__append('</a>\n          <li class="divider">\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">'),__append(t("core","NAVBAR:COMPANIES")),__append('</a>\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">'),__append(t("core","NAVBAR:PROD_FUNCTIONS")),__append('</a>\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">'),__append(t("core","NAVBAR:DIVISIONS")),__append('</a>\n          <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">'),__append(t("core","NAVBAR:SUBDIVISIONS")),__append('</a>\n          <li class="divider">\n          <li class="dropdown-header">'),__append(t("suggestions","navbar:kaizen")),__append('\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenSections">'),__append(t("suggestions","navbar:sections")),__append('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenAreas">'),__append(t("suggestions","navbar:areas")),__append('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenCategories">'),__append(t("suggestions","navbar:categories")),__append('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenCauses">'),__append(t("suggestions","navbar:causes")),__append('</a>\n          <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenRisks">'),__append(t("suggestions","navbar:risks")),__append("</a>\n        </ul>\n    </ul>\n    "),function(){__append('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      '),__append(user.getLabel()),__append('\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online data-loggedin><a href="#users/'),__append(user.data._id),__append('">'),__append(t("core","NAVBAR:MY_ACCOUNT")),__append('</a>\n      <li class="divider">\n      <li class="dropdown-header">'),__append(t("core","NAVBAR:UI_LOCALE")),__append('\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">'),__append(t("core","NAVBAR:LOCALE_PL")),__append('</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">'),__append(t("core","NAVBAR:LOCALE_US")),__append('</a>\n      <li class="divider">\n      <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__append(t("core","NAVBAR:LOG_IN")),__append('</a>\n      <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__append(t("core","NAVBAR:LOG_OUT")),__append("</a>\n    </ul>\n  </li>\n</ul>\n")}.call(this),__append("\n  </div>\n</div>\n");return __output.join("")}});