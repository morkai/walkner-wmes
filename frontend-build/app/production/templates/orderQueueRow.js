define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr data-order="'),__append(order.no),__append('" data-operation="'),__append(operation.no),__append('">\n  <td class="is-min production-orderQueue-no">'),__append(no),__append('.</td>\n  <td class="production-orderQueue-order">\n    '),__append(order.no),__append(": "),__append(productName||"?"),__append("<br>\n    "),__append(operation.no),__append(": "),__append(operation.name||"?"),__append('</td>\n  <td class="actions">\n    <div class="actions-group">\n      <button type="button" class="btn btn-lg btn-default" data-action="moveUp"><i class="fa fa-arrow-up"></i></button>\n      <button type="button" class="btn btn-lg btn-default" data-action="moveDown"><i class="fa fa-arrow-down"></i></button>\n      <button type="button" class="btn btn-lg btn-default" data-action="remove"><i class="fa fa-remove"></i></button>\n    </div>\n  </td>\n</tr>\n');return __output.join("")}});