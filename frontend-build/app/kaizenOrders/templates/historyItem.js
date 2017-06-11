define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="kaizenOrders-history-item '),__append(item.changes.length?"has-changes":""),__append(" "),__append(""!==item.comment?"has-comment":""),__append(" "),__append(item.seen?"":"is-unseen"),__append('">\n  <span class="kaizenOrders-history-user">'),__append(item.user),__append('</span>,\n  <time class="kaizenOrders-history-time" datetime="'),__append(item.time.iso),__append('" title="'),__append(item.time.long),__append('">'),__append(item.time.daysAgo>5?item.time.long:item.time.human),__append("</time>:\n  "),item.changes.length&&(__append('\n  <table class="table table-condensed kaizenOrders-history-changes">\n    <tbody>\n      '),item.changes.forEach(function(e){__append('\n      <tr>\n        <td class="is-min">'),__append(e.label),__append(':</td>\n        <td class="is-min"><span class="'),__append(e.oldValue.more?"has-more":""),__append('" data-content="'),__append(escapeFn(e.oldValue.more)),__append('">'),__append(e.oldValue),__append('</span></td>\n        <td class="is-min"><i class="fa fa-arrow-right"></i></td>\n        <td><span class="'),__append(e.newValue.more?"has-more":""),__append('" data-content="'),__append(escapeFn(e.newValue.more)),__append('">'),__append(e.newValue),__append("</span></td>\n        <td></td>\n      </tr>\n      ")}),__append("\n    </tbody>\n  </table>\n  ")),__append("\n  "),""!==item.comment&&(__append('\n  <p class="kaizenOrders-history-comment">'),__append(escapeFn(item.comment)),__append("</p>\n  ")),__append("\n</div>");return __output.join("")}});