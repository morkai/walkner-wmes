define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr id="'),__append(idPrefix),__append("-"),__append(entry._id),__append('" data-model-id="'),__append(entry._id),__append('" data-model-index="'),__append(modelIndex),__append('" class="'),__append(modelIndex%2?"kanban-is-even":"kanban-is-odd"),__append(" "),__append(entry.rowClassName),__append('">\n  '),columns.list.forEach(function(n){__append("\n  "),n.arrayIndex?(__append("\n  "),entry[n._id].forEach(function(a,e){__append('\n  <td class="kanban-td '),__append(n.tdClassName(a,n,e,entry)),__append('" data-column-id="'),__append(n._id),__append('" data-array-index="'),__append(e),__append('" tabindex="0">\n    <span class="kanban-td-value '),__append(n.valueClassName(a,n,e,entry)),__append('"><span class="kanban-td-value-inner">'),__append(n.renderValue(a,n,e,entry)),__append("</span></span>\n  </td>\n  ")}),__append("\n  ")):(__append('\n  <td class="kanban-td '),__append(n.tdClassName(entry[n._id],n,-1,entry)),__append('" data-column-id="'),__append(n._id),__append('" tabindex="0">\n    <span class="kanban-td-value '),__append(n.valueClassName(entry[n._id],n,-1,entry)),__append('"><span class="kanban-td-value-inner">'),__append(n.renderValue(entry[n._id],n,-1,entry)),__append("</span></span>\n  </td>\n  ")),__append("\n  ")}),__append('\n  <td class="kanban-td" data-column-id="filler2" colspan="2"></td>\n</tr>\n');return __output.join("")}});