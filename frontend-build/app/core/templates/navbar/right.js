define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      '),__output.push(user.getLabel()),__output.push('\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online data-loggedin><a href="#users/'),__output.push(user.data._id),__output.push('">'),__output.push(t("core","NAVBAR:MY_ACCOUNT")),__output.push('</a>\n      <li class="divider">\n      <li class="dropdown-header">'),__output.push(t("core","NAVBAR:UI_LOCALE")),__output.push('\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">'),__output.push(t("core","NAVBAR:LOCALE_PL")),__output.push('</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">'),__output.push(t("core","NAVBAR:LOCALE_US")),__output.push('</a>\n      <li class="divider">\n      <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__output.push(t("core","NAVBAR:LOG_IN")),__output.push('</a>\n      <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__output.push(t("core","NAVBAR:LOG_OUT")),__output.push('</a>\n    </ul>\n  </li>\n</ul>\n<!--\n<button class="btn btn-warning navbar-btn navbar-right navbar-feedback" type="button" title="'),__output.push(t("core","feedback:button:tooltip")),__output.push('">'),__output.push(t("core","feedback:button:text")),__output.push("</button>\n//-->\n");return __output.join("")}});