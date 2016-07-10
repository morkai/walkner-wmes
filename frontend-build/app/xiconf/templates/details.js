define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-default">\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:srcId")),__append('</div>\n          <div class="prop-value">'),__append(model.srcId),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:srcTitle")),__append('</div>\n          <div class="prop-value">'),__append(model.srcTitle||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:srcIp")),__append('</div>\n          <div class="prop-value">'),__append(model.srcIp),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:srcUuid")),__append('</div>\n          <div class="prop-value">'),__append(model.srcUuid),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.order&&(__append('\n  <div class="panel panel-primary xiconf-details-order">\n    <div class="panel-heading">\n      '),__append(t("xiconf","PANEL:TITLE:details:order")),__append('\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:no")),__append('</div>\n          <div class="prop-value" title="'),__append(t("xiconf","details:showOrderSummaryLink")),__append('"><a href="#xiconf/orders/'),__append(model.order.no),__append('">'),__append(model.order.no),__append('</a></div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:quantity")),__append('</div>\n          <div class="prop-value">'),__append(model.order.quantity),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:successCounter")),__append('</div>\n          <div class="prop-value">'),__append(model.order.successCounter),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:failureCounter")),__append('</div>\n          <div class="prop-value">'),__append(model.order.failureCounter),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:startedAt")),__append('</div>\n          <div class="prop-value">'),__append(time.format(model.order.startedAt,"LL, HH:mm:ss.SSS")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:finishedAt")),__append('</div>\n          <div class="prop-value">'),__append(time.format(model.order.finishedAt,"LL, HH:mm:ss.SSS")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:duration")),__append('</div>\n          <div class="prop-value">'),__append(time.toString(model.order.duration/1e3,!1,!0)),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  ")),__append('\n  <div class="panel panel-'),__append(model.cancelled?"default":"success"===model.result?"success":"danger"),__append(' xiconf-details-entry">\n    <div class="panel-heading">\n      '),__append(t("xiconf","PANEL:TITLE:details:entry")),__append('\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:prodLine")),__append('</div>\n          <div class="prop-value">'),__append(model.prodLine||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:serviceTag")),__append('</div>\n          <div class="prop-value">'),__append(model.serviceTag||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:nc12")),__append('</div>\n          <div class="prop-value">'),__append(model.nc12||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:gprsNc12")),__append('</div>\n          <div class="prop-value">'),__append(model.gprsNc12||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:programName")),__append('</div>\n          <div class="prop-value">'),__append(escape(model.program?model.program.name:model.programName||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:counter")),__append('</div>\n          <div class="prop-value">'),__append(model.counter),__append(model.order?"/"+model.order.quantity:""),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:startedAt")),__append('</div>\n          <div class="prop-value">'),__append(time.format(model.startedAt,"LL, HH:mm:ss.SSS")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:finishedAt")),__append('</div>\n          <div class="prop-value">'),__append(time.format(model.finishedAt,"LL, HH:mm:ss.SSS")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:duration")),__append('</div>\n          <div class="prop-value">'),__append(time.toString(model.duration/1e3,!1,!0)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:errorCode")),__append('</div>\n          <div class="prop-value">'),__append(model.errorCode?t("xiconf","error:"+model.errorCode):"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:exception")),__append('</div>\n          <div class="prop-value">'),__append(escape(model.exception||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:workflowFile")),__append('</div>\n          <div class="prop-value">'),__append(escape(model.workflowPath||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconf","PROPERTY:featureFile")),__append('</div>\n          <div class="prop-value">'),__append(escape(model.featurePath||"-")),__append('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="xiconf-tabs">\n    <ul class="nav nav-tabs">\n      <li data-tab="log"><a href="#'),__append(idPrefix),__append('-log" data-toggle="tab">'),__append(t("xiconf","tab:log")),__append("</a></li>\n      "),model.output&&(__append('\n      <li data-tab="output"><a href="#'),__append(idPrefix),__append('-output" data-toggle="tab">'),__append(t("xiconf","tab:output")),__append("</a></li>\n      ")),__append("\n      "),model.gprsOrderFile&&(__append('\n      <li data-tab="gprsOrderFile"><a href="#'),__append(idPrefix),__append('-gprsOrderFile" data-toggle="tab">'),__append(t("xiconf","tab:gprsOrderFile")),__append("</a></li>\n      ")),__append("\n      "),model.workflow&&(__append('\n      <li data-tab="workflow"><a href="#'),__append(idPrefix),__append('-workflow" data-toggle="tab">'),__append(t("xiconf","tab:workflow")),__append("</a></li>\n      ")),__append("\n      "),model.feature&&(__append('\n      <li data-tab="feature" data-highlight><a href="#'),__append(idPrefix),__append('-feature" data-toggle="tab">'),__append(t("xiconf","tab:feature")),__append("</a></li>\n      ")),__append("\n      "),model.leds&&(__append('\n      <li data-tab="leds"><a href="#'),__append(idPrefix),__append('-leds" data-toggle="tab">'),__append(t("xiconf","tab:leds")),__append("</a></li>\n      ")),__append("\n      "),model.hidLamps&&(__append('\n      <li data-tab="hidLamps"><a href="#'),__append(idPrefix),__append('-hidLamps" data-toggle="tab">'),__append(t("xiconf","tab:hidLamps")),__append("</a></li>\n      ")),__append("\n      "),model.gprsInputFile&&(__append('\n      <li data-tab="gprsInputFile" data-highlight><a href="#'),__append(idPrefix),__append('-gprsInputFile" data-toggle="tab">'),__append(t("xiconf","tab:gprsInputFile")),__append("</a></li>\n      ")),__append("\n      "),model.gprsOutputFile&&(__append('\n      <li data-tab="gprsOutputFile" data-highlight><a href="#'),__append(idPrefix),__append('-gprsOutputFile" data-toggle="tab">'),__append(t("xiconf","tab:gprsOutputFile")),__append("</a></li>\n      ")),__append("\n      "),model.program&&(__append('\n      <li data-tab="program"><a href="#'),__append(idPrefix),__append('-program" data-toggle="tab">'),__append(t("xiconf","tab:program")),__append("</a></li>\n      ")),__append('\n    </ul>\n    <div class="tab-content">\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-log">\n        <table class="table table-bordered xiconf-log">\n          <tbody>\n            '),log.forEach(function(p){__append('\n            <tr>\n              <td><time datetime="'),__append(p.datetime),__append('">'),__append(p.time),__append("</time></td>\n              <td>"),__append(p.text),__append("</td>\n            </tr>\n            ")}),__append("\n          </tbody>\n        </table>\n      </div>\n      "),model.output&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-output"><pre><code>'),__append(escape(model.output||"-")),__append("</code></pre></div>\n      ")),__append("\n      "),model.gprsOrderFile&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-gprsOrderFile"><pre><code>'),__append(escape(model.gprsOrderFile||"-")),__append("</code></pre></div>\n      ")),__append("\n      "),model.workflow&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-workflow"><pre><code>'),__append(escape(model.workflow||"-")),__append("</code></pre></div>\n      ")),__append("\n      "),model.feature&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-feature"><pre><code class="xml">'),__append(escape(model.feature||"-")),__append("</code></pre></div>\n      ")),__append("\n      "),model.leds&&(__append('\n      <div class="tab-pane xiconf-details-leds" id="'),__append(idPrefix),__append('-leds"></div>\n      ')),__append("\n      "),model.hidLamps&&(__append('\n      <div class="tab-pane xiconf-details-hidLamps" id="'),__append(idPrefix),__append('-hidLamps"></div>\n      ')),__append("\n      "),model.gprsInputFile&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-gprsInputFile"><pre><code class="json">'),__append(escape(model.gprsInputFile||"-")),__append("</code></pre></div>\n      ")),__append("\n      "),model.gprsOutputFile&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-gprsOutputFile"><pre><code class="xml">'),__append(escape(model.gprsOutputFile||"-")),__append("</code></pre></div>\n      ")),__append("\n      "),model.program&&(__append('\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-program">\n        <div class="xiconf-details-steps"></div>\n        <div class="xiconf-details-metrics"></div>\n      </div>\n      ')),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});