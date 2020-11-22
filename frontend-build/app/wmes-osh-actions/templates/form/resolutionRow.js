define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<tr data-id="'),__append(resolution.rid),__append('">\n  <td class="is-min text-fixed">\n    <a href="'),__append(entry.url),__append('" target="_blank">'),__append(resolution.rid),__append('</a>\n    <input type="hidden" name="resolutions['),__append(i),__append(']._id" value="'),__append(resolution._id),__append('">\n    <input type="hidden" name="resolutions['),__append(i),__append('].rid" value="'),__append(resolution.rid),__append('">\n    <input type="hidden" name="resolutions['),__append(i),__append('].type" value="'),__append(resolution.type),__append('">\n  </td>\n  <td class="is-min">'),__append(entry.status),__append("</td>\n  <td>"),__append(escapeFn(entry.subject)),__append('</td>\n  <td class="is-min">'),__append(entry.implementers),__append('</td>\n  <td class="actions">\n    <div class="actions-group">\n      <button data-action="removeResolution" type="button" class="btn btn-default" title="'),__append(t("resolutions:unlink")),__append('"><i class="fa fa-unlink"></i></button>\n    </div>\n  </td>\n</tr>\n');return __output}});