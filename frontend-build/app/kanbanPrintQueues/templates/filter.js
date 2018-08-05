define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form" autocomplete="off">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-todo">'),__append(helpers.t("job:status")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-todo" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[!0,!1].forEach(function(n){__append('\n      <label class="btn btn-default">\n        <input type="radio" name="todo" value="'),__append(n),__append('"> '),__append(helpers.t("todo:"+n)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(helpers.t("filter:submit")),__append("</span></button>\n    "),user.isAllowedTo("KANBAN:PRINT")&&(__append('\n    <hr>\n    <button id="'),__append(idPrefix),__append('-groupByWorkstations" type="button" class="btn btn-default">'),__append(helpers.t("filter:groupByWorkstations")),__append("</button>\n    <hr>\n    ")),__append('\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-quickPrint-kanbanIds">'),__append(helpers.t("quickPrint:label")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-quickPrint" class="kanbanPrintQueues-quickPrint">\n      <input id="'),__append(idPrefix),__append('-quickPrint-kanbanIds" class="form-control text-mono kanbanPrintQueues-quickPrint-kanbanIds" type="text" placeholder="'),__append(helpers.t("quickPrint:kanbanIds")),__append('">\n      <select id="'),__append(idPrefix),__append('-quickPrint-layouts" class="form-control is-expandable kanbanPrintQueues-quickPrint-layouts" multiple size="1" data-expanded-length="'),__append(layouts.length),__append('">\n        '),layouts.forEach(function(n){__append('\n        <option value="'),__append(n),__append('">'),__append(helpers.t("layout:"+n)),__append("</option>\n        ")}),__append('\n      </select>\n      <button id="'),__append(idPrefix),__append('-quickPrint-submit" class="btn btn-primary kanbanPrintQueues-quickPrint-submit" type="button" title="'),__append(helpers.t("quickPrint:submit")),__append('"><i class="fa fa-print"></i></button>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});