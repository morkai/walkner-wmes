define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="settings planning-settings" autocomplete="off">\n  <div class="list-group">\n    <a class="list-group-item" href="#wh/settings?tab=planning" data-tab="planning" data-privileges="WH:MANAGE">'),__append(t("settings:tab:planning")),__append('</a>\n    <a class="list-group-item" href="#wh/settings?tab=pickup" data-tab="pickup" data-privileges="WH:MANAGE">'),__append(t("settings:tab:pickup")),__append('</a>\n    <a class="list-group-item" href="#wh/settings?tab=delivery" data-tab="delivery" data-privileges="WH:MANAGE">'),__append(t("settings:tab:delivery")),__append('</a>\n    <a class="list-group-item" href="#wh/settings?tab=users" data-tab="users" data-privileges="WH:MANAGE:USERS">'),__append(t("settings:tab:users")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="planning">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-groupDuration">'),__append(t("settings:planning:groupDuration")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-planning-groupDuration" class="form-control" name="wh.planning.groupDuration" type="number" step="1" min="1" max="24">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-groupExtraItems">'),__append(t("settings:planning:groupExtraItems")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:groupExtraItems:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-groupExtraItems" class="form-control" name="wh.planning.groupExtraItems" type="number" step="1" min="0" max="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-ignoredMrps">'),__append(t("settings:planning:ignoredMrps")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:ignoredMrps:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-ignoredMrps" name="wh.planning.ignoredMrps" type="text" autocomplete="new-password" data-setting>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-enabledMrps">'),__append(t("settings:planning:enabledMrps")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:enabledMrps:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-enabledMrps" name="wh.planning.enabledMrps" type="text" autocomplete="new-password" data-setting>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-lineGroups">'),__append(t("settings:planning:lineGroups")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:lineGroups:help")),__append('</span>\n        <textarea id="'),__append(idPrefix),__append('-planning-lineGroups" name="wh.planning.lineGroups" class="form-control text-fixed" rows="6" data-keyup-delay="10000"></textarea>\n      </div>\n    </div>\n    <div class="panel-body" data-tab="pickup">\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-planning-ignorePsStatus" name="wh.planning.ignorePsStatus" type="checkbox" value="true">\n          '),__append(t("settings:planning:ignorePsStatus")),__append('\n        </label>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxSetSize">'),__append(t("settings:planning:maxSetSize")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-planning-maxSetSize" class="form-control" name="wh.planning.maxSetSize" type="number" step="1" min="1" max="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-minSetDuration">'),__append(t("settings:planning:minSetDuration")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:minSetDuration:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-minSetDuration" class="form-control" name="wh.planning.minSetDuration" type="number" step="1" min="1" max="600">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxSetDuration">'),__append(t("settings:planning:maxSetDuration")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:maxSetDuration:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-maxSetDuration" class="form-control" name="wh.planning.maxSetDuration" type="number" step="1" min="1" max="600">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxSetDifference">'),__append(t("settings:planning:maxSetDifference")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:maxSetDifference:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-maxSetDifference" class="form-control" name="wh.planning.maxSetDifference" type="number" step="1" min="1" max="600">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxSetsPerLine">'),__append(t("settings:planning:maxSetsPerLine")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-planning-maxSetsPerLine" class="form-control" name="wh.planning.maxSetsPerLine" type="number" step="1" min="0" max="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-minPickupDowntime">'),__append(t("settings:planning:minPickupDowntime")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:minPickupDowntime:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-minPickupDowntime" class="form-control" name="wh.planning.minPickupDowntime" type="number" step="1" min="1" max="28800">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxPickupDowntime">'),__append(t("settings:planning:maxPickupDowntime")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:maxPickupDowntime:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-maxPickupDowntime" class="form-control" name="wh.planning.maxPickupDowntime" type="number" step="1" min="1" max="1440">\n      </div>\n    </div>\n    <div class="panel-body" data-tab="delivery">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-minTimeForDelivery">'),__append(t("settings:planning:minTimeForDelivery")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:minTimeForDelivery:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-minTimeForDelivery" class="form-control" name="wh.planning.minTimeForDelivery" type="number" step="1" min="1" max="480">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-lateDeliveryTime">'),__append(t("settings:planning:lateDeliveryTime")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:lateDeliveryTime:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-lateDeliveryTime" class="form-control" name="wh.planning.lateDeliveryTime" type="number" step="1" min="1" max="480">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxSetCartsPerDelivery">'),__append(t("settings:planning:maxSetCartsPerDelivery")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:maxSetCartsPerDelivery:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-maxSetCartsPerDelivery" class="form-control" name="wh.planning.maxSetCartsPerDelivery" type="number" step="1" min="1" max="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-minDeliveryDowntime">'),__append(t("settings:planning:minDeliveryDowntime")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:minDeliveryDowntime:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-minDeliveryDowntime" class="form-control" name="wh.planning.minDeliveryDowntime" type="number" step="1" min="1" max="28800">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxDeliveryDowntime">'),__append(t("settings:planning:maxDeliveryDowntime")),__append('</label>\n        <span class="help-block">'),__append(t("settings:planning:maxDeliveryDowntime:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-maxDeliveryDowntime" class="form-control" name="wh.planning.maxDeliveryDowntime" type="number" step="1" min="1" max="1440">\n      </div>\n    </div>\n    <div class="panel-body" data-tab="users">\n      '),["fmx","kitter","platformer","packer","dist-components","dist-packaging"].forEach(function(n){__append('\n      <div class="form-group">\n        <label>'),__append(t("func:"+n)),__append('</label>\n        <input type="text" autocomplete="new-password" data-user-func="'),__append(n),__append('">\n      </div>\n      ')}),__append("\n    </div>\n  </div>\n</form>\n");return __output}});