define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<table>\n  <tbody>\n  "),["orderNo","operationNo","quantityDone","workerCount","startedAt","finishedAt"].forEach(function(n){__append("\n  <tr>\n    <th>"),__append(t("production","execution:order:"+n)),__append("</th>\n    <td>"),__append(escapeFn(order[n])),__append("</td>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});