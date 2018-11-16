define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<ul class="pscs-menu">\n  <li><a class="pscs-menu-intro" href="#pscs"><i class="fa fa-home"></i> Strona główna</a></li>\n  <li><a class="pscs-menu-learn" href="#pscs/learn"><i class="fa fa-graduation-cap"></i> Szkolenie</a></li>\n  <li><a class="pscs-menu-exam" href="#pscs/exam"><i class="fa fa-edit"></i> Test</a></li>\n  '),user.isAllowedTo("PSCS:VIEW")&&__append('\n  <li><a href="#pscs/results"><i class="fa fa-line-chart"></i> Wyniki</a></li>\n  '),__append("\n</ul>\n");return __output.join("")}});