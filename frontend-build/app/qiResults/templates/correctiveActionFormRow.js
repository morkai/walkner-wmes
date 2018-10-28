define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr>\n  <td class="is-min">'),__append(action.no),__append('</td>\n  <td class="is-min">\n    <select class="form-control" name="correctiveActions['),__append(action.i),__append('].status" '),__append(canChangeStatus?"":"disabled"),__append(">\n      "),statuses.forEach(function(n){__append('\n      <option value="'),__append(n.id),__append('" '),__append(n.id===action.status?"selected":""),__append(">"),__append(escapeFn(n.text)),__append("</option>\n      ")}),__append('\n    </select>\n  </td>\n  <td><input class="form-control" name="correctiveActions['),__append(action.i),__append('].when" type="date" min="2016-01-01" value="'),__append(action.when?time.format(action.when,"YYYY-MM-DD"):""),__append('" '),__append(canChangeWhen?"":"disabled"),__append('></td>\n  <td><input name="correctiveActions['),__append(action.i),__append('].who" type="text" autocomplete="new-password" '),__append(canChangeWho?"":"disabled"),__append('></td>\n  <td><textarea class="form-control" name="correctiveActions['),__append(action.i),__append('].what" type="text" autocomplete="new-password" rows="1" '),__append(canChangeWhat?"":"disabled"),__append(">"),__append(escapeFn(action.what)),__append('</textarea></td>\n  <td class="is-min">\n    '),canRemove&&__append('\n    <button class="btn btn-default" name="removeAction" type="button"><i class="fa fa-remove"></i>\n    '),__append("\n  </button>\n  </td>\n</tr>\n");return __output.join("")}});