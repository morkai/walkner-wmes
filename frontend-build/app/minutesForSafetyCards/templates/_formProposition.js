define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr>\n  <td>\n    <textarea class="form-control" name="'),__append(type),__append("["),__append(i),__append('].what" rows="2" required>'),__append(escapeFn(proposition.what)),__append('</textarea>\n  </td>\n  <td class="actions">\n    <div class="actions-group">\n      <button type="button" class="btn btn-default" data-remove="proposition"><i class="fa fa-times"></i></button>\n    </div>\n  </td>\n</tr>\n');return __output.join("")}});