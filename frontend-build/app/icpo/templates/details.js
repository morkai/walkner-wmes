define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-default">\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:srcId")),__append('</div>\n          <div class="prop-value">'),__append(model.srcId),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:srcTitle")),__append('</div>\n          <div class="prop-value">'),__append(model.srcTitle),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:srcIp")),__append('</div>\n          <div class="prop-value">'),__append(model.srcIp),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:srcUuid")),__append('</div>\n          <div class="prop-value">'),__append(model.srcUuid),__append('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-'),__append("success"===model.result?"success":"danger"),__append(' icpo-details-entry">\n    <div class="panel-heading">\n      '),__append(t("icpo","PANEL:TITLE:details")),__append('\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:serviceTag")),__append('</div>\n          <div class="prop-value">'),__append(model.serviceTag),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:driver")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.driver)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:gprs")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.gprs)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:led")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.led)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:startedAt")),__append('</div>\n          <div class="prop-value">'),__append(time.format(model.startedAt,"LL, LTS")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:finishedAt")),__append('</div>\n          <div class="prop-value">'),__append(time.format(model.finishedAt,"LL, LTS")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:duration")),__append('</div>\n          <div class="prop-value">'),__append(time.toString((model.finishedAt-model.startedAt)/1e3,!1,!0)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:errorCode")),__append('</div>\n          <div class="prop-value">'),__append(model.errorCode?t("icpo","error:"+model.errorCode):"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("icpo","PROPERTY:exception")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.exception||"-")),__append('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="icpo-tabs">\n    <ul class="nav nav-tabs">\n      <li data-tab="log"><a href="#'),__append(idPrefix),__append('-log" data-toggle="tab">'),__append(t("icpo","tab:log")),__append('</a></li>\n      <li data-tab="output"><a href="#'),__append(idPrefix),__append('-output" data-toggle="tab">'),__append(t("icpo","tab:output")),__append('</a></li>\n      <li data-tab="orderData"><a href="#'),__append(idPrefix),__append('-orderData" data-toggle="tab">'),__append(t("icpo","tab:orderData")),__append('</a></li>\n      <li data-tab="driverData" data-highlight><a href="#'),__append(idPrefix),__append('-driverData" data-toggle="tab">'),__append(t("icpo","tab:driverData")),__append('</a></li>\n      <li data-tab="gprsData" data-highlight><a href="#'),__append(idPrefix),__append('-gprsData" data-toggle="tab">'),__append(t("icpo","tab:gprsData")),__append('</a></li>\n      <li data-tab="inputData" data-highlight><a href="#'),__append(idPrefix),__append('-inputData" data-toggle="tab">'),__append(t("icpo","tab:inputData")),__append('</a></li>\n      <li data-tab="outputData" data-highlight><a href="#'),__append(idPrefix),__append('-outputData" data-toggle="tab">'),__append(t("icpo","tab:outputData")),__append('</a></li>\n    </ul>\n    <div class="tab-content">\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-log">\n        <table class="table table-bordered icpo-log">\n          <tbody>\n            '),log.forEach(function(p){__append('\n            <tr>\n              <td><time datetime="'),__append(p.datetime),__append('">'),__append(p.time),__append("</time></td>\n              <td>"),__append(p.text),__append("</td>\n            </tr>\n            ")}),__append('\n          </tbody>\n        </table>\n      </div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-output"><pre><code>'),__append(escapeFn(model.output||"-")),__append('</code></pre></div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-orderData"><pre><code class="txt">'),__append(escapeFn(model.orderData||"-")),__append('</code></pre></div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-driverData"><pre><code class="xml">'),__append(escapeFn(model.driverData||"-")),__append('</code></pre></div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-gprsData"><pre><code class="xml">'),__append(escapeFn(model.gprsData||"-")),__append('</code></pre></div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-inputData"><pre><code class="json">'),__append(escapeFn(model.inputData||"-")),__append('</code></pre></div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-outputData"><pre><code class="xml">'),__append(escapeFn(model.outputData||"-")),__append("</code></pre></div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});