define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(t){return _ENCODE_HTML_RULES[t]||t}escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr data-id="'),__append(id),__append('">\n  <td class="is-number">'),__append(no),__append(".</td>\n  <td>"),__append(escape(answer)),__append('</td>\n  <td class="actions">\n    <div class="actions-group">\n      <button type="button" class="btn btn-default" data-action="up"><i class="fa fa-arrow-up"></i></button>\n      <button type="button" class="btn btn-default" data-action="down"><i class="fa fa-arrow-down"></i></button>\n      <button type="button" class="btn btn-default" data-action="remove"><i class="fa fa-remove"></i></button>\n    </div>\n  </td>\n</tr>\n');return __output.join("")}});