define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output="";function __append(t){void 0!==t&&null!==t&&(__output+=t)}with(locals||{})__append('<table class="table table-bordered table-striped table-hover">\n  <thead>\n  <tr>\n    <th class="is-min">'),__append(t("todo:time")),__append('</th>\n    <th class="is-min">'),__append(t("todo:line")),__append('</th>\n    <th class="is-min">'),__append(t("todo:station")),__append('</th>\n    <th class="is-min">'),__append(t("todo:action")),__append("</th>\n    <th>"),__append(t("todo:data")),__append("</th>\n  </tr>\n  </thead>\n  <tbody></tbody>\n</table>\n");return __output}});