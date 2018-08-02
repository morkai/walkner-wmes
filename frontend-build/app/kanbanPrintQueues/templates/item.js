define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{}){__append('<tbody class="kanbanPrintQueues-item '),__append(expanded?"is-expanded":""),__append('" data-id="'),__append(queue._id),__append('" data-status="'),__append(queue.status),__append('">\n  '),__append(renderHd({idPrefix:idPrefix,helpers:helpers,queue:queue,what:what})),__append('\n  <tr id="'),__append(idPrefix),__append('-jobsContainer" class="kanbanPrintQueues-jobs-container">\n    <td colspan="26" class="is-colored">\n      <table class="table table-bordered table-condensed table-hover">\n        <thead>\n        <tr>\n          <th class="is-min">'),__append(helpers.t("job:_id")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("job:line")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("job:ccn")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("job:nc12")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("job:description")),__append('</th>\n          <th class="is-min">'),__append(helpers.t("job:storageBin")),__append("</th>\n          "),["kk","empty","full","wh","desc"].forEach(function(e){__append('\n          <th class="is-min">'),__append(helpers.t("layout:"+e)),__append("</th>\n          ")}),__append('\n          <th class="is-min">'),__append(helpers.t("job:kanbanId")),__append("</th>\n          ");for(var i=0;i<6;++i)__append('\n          <th class="is-min">'),__append(helpers.t("job:workstation:short",{n:i+1})),__append("</th>\n          ");__append("\n          "),user.isAllowedTo("KANBAN:PRINT","KANBAN:MANAGE")&&(__append('\n          <th class="actions">'),__append(helpers.t("core","LIST:COLUMN:actions")),__append("</th>\n          ")),__append('\n          <th></th>\n        </tr>\n        </thead>\n        <tbody id="'),__append(idPrefix),__append('-jobs" class="kanbanPrintQueues-jobs">\n        '),queue.jobs.forEach(function(e){__append("\n          "),__append(renderJob({idPrefix:idPrefix,helpers:helpers,queue:queue,job:e})),__append("\n        ")}),__append("\n        </tbody>\n      </table>\n    </td>\n  </tr>\n</tbody>\n")}return __output.join("")}});