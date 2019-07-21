define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed">\n  <thead>\n  <tr>\n    <th class="is-min text-right" style="border-left: none">'),__append(helpers.t("report:oql:"+property)),__append("</th>\n    "),weeks.forEach(function(e){__append('\n    <th class="is-min text-center">'),__append(e),__append("</th>\n    ")}),__append('\n    <th class="is-min text-center"></th>\n  </tr>\n  </thead>\n  <tbody>\n  '),rows.forEach(function(e){__append('\n  <tr data-id="'),__append(escapeFn(e._id)),__append('">\n    <th class="is-min text-right" title="'),__append(escapeFn(e.title)),__append('">'),__append(escapeFn(e.label)),__append("</th>\n    "),e.data.forEach(function(e){__append('\n    <td class="is-min is-number" style="width: 46px" title="'),__append(e.absolute),__append("/"),__append(e.total),__append('">\n      '),e.relative&&(__append("\n      "),__append(e.relative),__append("%\n      ")),__append("\n    </td>\n    ")}),__append('\n    <th class="is-min is-number text-right" title="'),__append(e.total.absolute),__append("/"),__append(e.total.total),__append('">\n      '),__append(e.total.relative),__append("%\n    </th>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});