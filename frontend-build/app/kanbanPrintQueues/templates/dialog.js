define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<dl>\n  <dt>"),__append(t("kanbanPrintQueues","job:_id")),__append("</dt>\n  <dd>"),__append(jobNo),__append("/"),__append(jobTotal),__append('. <span class="text-mono">'),__append(job._id),__append("</span></dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:line")),__append("</dt>\n  <dd>"),__append(escapeFn(job.line)),__append("</dd>\n  "),workstation>=0&&(__append("\n  <dt>"),__append(t("kanbanPrintQueues","job:workstation:long")),__append("</dt>\n  <dd>"),__append(workstation+1),__append("</dd>\n  ")),__append("\n  <dt>"),__append(t("kanbanPrintQueues","job:ccn")),__append('</dt>\n  <dd class="text-mono">'),__append(escapeFn(job.data.ccn)),__append("</dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:nc12")),__append('</dt>\n  <dd class="text-mono">'),__append(escapeFn(job.data.nc12)),__append("</dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:description")),__append('</dt>\n  <dd class="text-mono">'),__append(escapeFn(job.data.description)),__append("</dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:storageBin")),__append('</dt>\n  <dd class="text-mono">'),__append(escapeFn(job.data.storageBin)),__append("</dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:kanbanId")),__append('</dt>\n  <dd class="text-mono">'),__append(escapeFn(job.kanbanIds)),__append("</dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:labels")),__append("</dt>\n  <dd>\n    "),Object.keys(job.layoutCount).forEach(function(n){__append("\n    "),job.layoutCount[n]&&(__append("\n    ▪\t"),__append(t("kanbanPrintQueues","layoutCount:"+n,{count:job.layoutCount[n]})),__append("\n    ")),__append("\n    ")}),__append("\n  </dd>\n  <dt>"),__append(t("kanbanPrintQueues","job:status")),__append("</dt>\n  <dd>"),__append(escapeFn(t("kanbanPrintQueues",error?"status:error":"status:"+job.status,{error:error}))),__append("</dd>\n</dl>\n");return __output.join("")}});