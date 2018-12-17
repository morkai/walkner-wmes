define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="navbar-right fap-navbar">\n  <div class="fap-navbarBtn">\n    <div class="dropdown">\n      <button id="'),__append(idPrefix),__append('-menu" type="button" class="btn btn-warning dropdown-toggle" data-toggle="dropdown">'),__append(helpers.t("navbar:button")),__append('</button>\n      <ul class="dropdown-menu dropdown-menu-left">\n        '),browseEntriesLinks.forEach(function(n){__append('\n        <li class="navbar-with-button"><a href="#fap/entries?exclude(changes)&sort(-createdAt)&limit(-1337)'),__append(n.rql),__append('">'),__append(helpers.t("navbar:"+n.label)),__append('</a><button class="btn btn-default" data-href="#fap/entries?exclude(changes)&sort(-createdAt)&limit(-1337)&observers.user.id='),__append(user.data._id),__append(n.rql),__append('" title="'),__append(helpers.t("navbar:mine")),__append('"><i class="fa fa-user"></i></button></li>\n        ')}),__append('\n        <li class="divider"></li>\n        <li class="dropdown-header">'),__append(helpers.t("navbar:dictionaries")),__append('\n        <li data-privilege="FAP:MANAGE"><a href="#fap/categories">'),__append(helpers.t("navbar:categories")),__append('</a>\n      </ul>\n    </div>\n    <button id="'),__append(idPrefix),__append('-add" type="button" class="btn btn-warning fap-navbarBtn-add" title="'),__append(helpers.t("navbar:add")),__append('"><i class="fa fa-plus"></i></button>\n    <div id="'),__append(idPrefix),__append('-addForm"></div>\n  </div>\n</div>\n');return __output.join("")}});