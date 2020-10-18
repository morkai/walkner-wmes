define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append('<div class="navbar-inner">\n  '),function(){__append('<div class="navbar-header">\n  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n    <span class="sr-only">'),__append(t("NAVBAR:TOGGLE")),__append('</span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n  </button>\n  <a class="navbar-brand fa fa-cogs" href="#"></a>\n</div>\n')}.call(this),__append('\n  <div class="collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li><a href="#">'),__append(t("core","NAVBAR:DASHBOARD")),__append("</a>\n      "),function(){__append('<li data-privilege="USER" data-module="wmes-osh" data-online><a href="#osh/nearMisses">'),__append(t("wmes-osh-common","navbar:nearMisses")),__append("</a>\n")}.call(this),__append("\n      "),function(){__append('<li data-privilege="USER" data-module="wmes-osh" data-online><a href="#osh/kaizens">'),__append(t("wmes-osh-common","navbar:kaizens")),__append("</a>\n")}.call(this),__append("\n      "),function(){__append('<li data-online data-loggedin class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:OPINION:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-module="opinionSurveys"><a href="/opinion" target="_blank">'),__append(t("NAVBAR:OPINION:current")),__append('</a>\n    <li data-module="opinionSurveys"><a href="#opinionSurveyReport">'),__append(t("NAVBAR:OPINION:report")),__append('</a>\n    <li data-module="opinionSurveys"><a href="#opinionSurveyActions">'),__append(t("NAVBAR:OPINION:actions")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyResponses">'),__append(t("NAVBAR:OPINION:responses")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:OPINION:scanning")),__append('\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyScanTemplates">'),__append(t("NAVBAR:OPINION:scanTemplates")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyOmrResults">'),__append(t("NAVBAR:OPINION:omrResults")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:OPINION:dictionaries")),__append('\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveys">'),__append(t("NAVBAR:OPINION:surveys")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyEmployers">'),__append(t("NAVBAR:OPINION:employers")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyDivisions">'),__append(t("NAVBAR:OPINION:divisions")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyQuestions">'),__append(t("NAVBAR:OPINION:questions")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:DICTIONARIES")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__append(t("NAVBAR:USERS")),__append('</a>\n    <li class="divider">\n    '),["workplaces","divisions","buildings","locations","kinds","activityKinds","eventCategories","reasonCategories"].forEach(a=>{__append('\n    <li data-privilege="OSH:DICTIONARIES:VIEW" data-module="wmes-osh"><a href="#osh/'),__append(a),__append('">'),__append(t("wmes-osh-common",`navbar:${a}`)),__append("</a>\n    ")}),__append("\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:TOOLS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__append(t("NAVBAR:EVENTS")),__append('</a>\n    <li data-privilege="SUPER" data-module><a href="#logs/browserErrors">'),__append(t("NAVBAR:logs:browserErrors")),__append("</a>\n  </ul>\n</li>\n")}.call(this),__append("\n    </ul>\n    "),function(){__append('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      '),__append(user.getLabel()),__append('\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online data-loggedin><a href="#users/'),__append(user.data._id),__append('">'),__append(t("NAVBAR:MY_ACCOUNT")),__append('</a>\n      <li class="divider">\n      <li class="dropdown-header">'),__append(t("NAVBAR:UI_LOCALE")),__append('\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">'),__append(t("NAVBAR:LOCALE_PL")),__append('</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">'),__append(t("NAVBAR:LOCALE_US")),__append('</a>\n      <li class="divider">\n      <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__append(t("NAVBAR:LOG_IN")),__append('</a>\n      <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__append(t("NAVBAR:LOG_OUT")),__append("</a>\n    </ul>\n  </li>\n</ul>\n")}.call(this),__append("\n    "),user.isAllowedTo("USER")&&(__append("\n    "),function(){__append('<form id="'),__append(idPrefix),__append('-search" class="navbar-form navbar-right navbar-search" autocomplete="off">\n  <div class="form-group has-feedback">\n    <input id="'),__append(idPrefix),__append('-searchPhrase" type="text" autocomplete="new-password" class="form-control navbar-search-phrase">\n    <span class="fa fa-search form-control-feedback"></span>\n  </div>\n  <ul id="'),__append(idPrefix),__append('-searchResults" class="dropdown-menu navbar-search-results"></ul>\n</form>\n')}.call(this),__append("\n    ")),__append("\n  </div>\n</div>\n");return __output}});