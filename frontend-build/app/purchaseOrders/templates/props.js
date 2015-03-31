define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(p){return String(p).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-',po.open?"primary":"success",' pos-details-props">\n  <div class="panel-heading">',t("purchaseOrders","panel:props"),'</div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:_id"),'</div>\n          <div class="prop-value">',po._id,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:docDate"),'</div>\n          <div class="prop-value">',po.docDate,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:vendorId"),'</div>\n          <div class="prop-value">',po.vendor,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:vendorName"),'</div>\n          <div class="prop-value">',escape(po.vendorName),'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:pOrg"),'</div>\n          <div class="prop-value">',po.pOrg,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:pGr"),'</div>\n          <div class="prop-value">',po.pGr,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:plant"),'</div>\n          <div class="prop-value">',po.plant,'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:importedAt"),'</div>\n          <div class="prop-value">',po.importedAtText,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:createdAt"),'</div>\n          <div class="prop-value">',po.createdAtText,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("purchaseOrders","PROPERTY:updatedAt"),'</div>\n          <div class="prop-value">',po.updatedAtText||"-","</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});