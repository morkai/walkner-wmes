define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default d8Entries-history">\n  <div class="panel-heading">'),__append(t("d8Entries","PANEL:TITLE:changes")),__append("</div>\n  "),items.forEach(function(n,e){__append("\n  "),function(){__append('<div class="d8Entries-history-item '),__append(n.changes.length?"has-changes":""),__append(" "),__append(""!==n.comment?"has-comment":""),__append(" "),__append(n.seen?"":"is-unseen"),__append('">\n  <span class="d8Entries-history-user">'),__append(n.user),__append('</span>,\n  <time class="d8Entries-history-time" datetime="'),__append(n.time.iso),__append('" title="'),__append(n.time.long),__append('">'),__append(n.time.daysAgo>5?n.time.long:n.time.human),__append("</time>:\n  "),n.changes.length&&(__append('\n  <table class="table table-condensed d8Entries-history-changes">\n    <tbody>\n      '),n.changes.forEach(function(n){__append('\n      <tr>\n        <td class="is-min">'),__append(n.label),__append(':</td>\n        <td class="is-min"><span class="'),__append(n.oldValue.more?"has-more":""),__append('" data-content="'),__append(escapeFn(n.oldValue.more)),__append('">'),__append(n.oldValue),__append('</span></td>\n        <td class="is-min"><i class="fa fa-arrow-right"></i></td>\n        <td><span class="'),__append(n.newValue.more?"has-more":""),__append('" data-content="'),__append(escapeFn(n.newValue.more)),__append('">'),__append(n.newValue),__append("</span></td>\n        <td></td>\n      </tr>\n      ")}),__append("\n    </tbody>\n  </table>\n  ")),__append("\n  "),""!==n.comment&&(__append('\n  <p class="d8Entries-history-comment">'),__append(escapeFn(n.comment)),__append("</p>\n  ")),__append("\n</div>\n")}.call(this),__append("\n  ")}),__append('\n  <form class="d8Entries-history-form">\n    '),canEdit&&(__append('\n    <div class="message message-inline message-info">\n      <p>'),__append(t("d8Entries","history:editMessage",{editUrl:editUrl})),__append("</p>\n    </div>\n    ")),__append('\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(t("d8Entries","PROPERTY:comment")),__append('</label>\n      <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="3"></textarea>\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n        <i class="fa fa-comment-o"></i><span>'),__append(t("d8Entries","history:submit")),__append("</span>\n      </button>\n    </div>\n  </form>\n</div>\n");return __output.join("")}});