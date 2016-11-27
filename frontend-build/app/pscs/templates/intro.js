define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="pscs-page pscs-intro">\n  '),function(){__append('<div class="pscs-header">\n  <h1>'),__append(t("pscs","header:title")),__append("</h1>\n  <h2>"),__append(t("pscs","header:subtitle")),__append("</h2>\n</div>\n")}.call(this),__append("\n  "),function(){__append('<ul class="pscs-menu">\n  <li><a class="pscs-menu-intro" href="#pscs"><i class="fa fa-home"></i> Strona główna</a></li>\n  <li><a class="pscs-menu-learn" href="#pscs/learn"><i class="fa fa-graduation-cap"></i> Szkolenie</a></li>\n  <li><a class="pscs-menu-exam" href="#pscs/exam"><i class="fa fa-edit"></i> Test</a></li>\n  '),user.isAllowedTo("PSCS:VIEW")&&__append('\n  <li><a href="#pscs/results"><i class="fa fa-line-chart"></i> Wyniki</a></li>\n  '),__append("\n</ul>\n")}.call(this),__append('\n  <div class="pscs-body">\n    <a href="#pscs/learn" class="btn btn-info pscs-intro-link">\n      <i class="fa fa-graduation-cap"></i>\n      '),__append(t("pscs","intro:learn")),__append('\n    </a><!--\n    //--><a href="#pscs/exam" class="btn btn-warning pscs-intro-link">\n      <i class="fa fa-edit"></i>\n      '),__append(t("pscs","intro:exam")),__append("\n    </a><!--\n    "),user.isAllowedTo("PSCS:VIEW")&&(__append('\n    //--><a href="#pscs/results" class="btn btn-success pscs-intro-link">\n      <i class="fa fa-line-chart"></i>\n      '),__append(t("pscs","intro:results")),__append("\n    </a><!--\n    ")),__append("//-->\n  </div>\n</div>\n");return __output.join("")}});