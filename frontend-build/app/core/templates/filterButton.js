define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="btn-group">\n  <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("core","filter:submit")),__append('</span></button>\n  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="'),__append(t("core","filter:filters")),__append('"><span class="caret"></span></button>\n  <ul class="dropdown-menu">\n    '),filters.forEach(function(n){__append('\n    <li>\n      <a data-filter="'),__append(n),__append('">\n        '),__append(t.has("filter:"+n)?t("filter:"+n):t.has("PROPERTY:"+n)?t("PROPERTY:"+n):t("core","filter:"+n)),__append("\n      </a>\n    </li>\n    ")}),__append("\n  </ul>\n</div>\n");return __output.join("")}});