define(["../broker","../time","../router","../viewport","../user"],function(a,e,n,t,p){"use strict";var o=["css!app/paintShop/assets/main"],i=["i18n!app/nls/paintShop","i18n!app/nls/wh"],r=p.auth("PAINT_SHOP:VIEW"),s=p.auth("LOCAL","PAINT_SHOP:VIEW"),u=p.auth("PAINT_SHOP:MANAGE");n.map("/paintShop/:date",s,function(n){"current"===n.params.date&&(n.params.date="0d"),/^-?[0-9]+d$/.test(n.params.date)&&(n.params.date=e.getMoment().subtract(e.getMoment().hours()<6?1:0,"days").startOf("day").add(+n.params.date.replace("d",""),"days").format("YYYY-MM-DD"),a.publish("router.navigate",{url:"/paintShop/"+n.params.date,replace:!0,trigger:!1})),t.loadPage(["app/paintShop/pages/PaintShopPage"].concat(o,i),function(a){return new a({date:n.params.date,selectedMrp:n.query.mrp,selectedPaint:n.query.paint,fullscreen:void 0!==n.query.fullscreen})})}),n.map("/paintShop/paints",r,function(a){t.loadPage(["app/paintShopPaints/PaintShopPaintCollection","app/paintShopPaints/pages/PaintShopPaintListPage",i[0]],function(e,n){return new n({pageClassName:"page-max-flex",collection:new e(null,{rqlQuery:a.rql})})})}),n.map("/paintShop/ignoredComponents",r,function(a){t.loadPage(["app/ps-ignoredComponents/PsIgnoredComponentCollection","app/ps-ignoredComponents/pages/ListPage",i[0]],function(e,n){return new n({pageClassName:"page-max-flex",collection:new e(null,{rqlQuery:a.rql})})})}),n.map("/paintShop/load",r,function(a){t.loadPage(["app/paintShop/pages/PaintShopLoadPage"].concat(o,i),function(e){return new e({query:a.query})})}),n.map("/paintShop;settings",u,function(a){t.loadPage(["app/paintShop/pages/PaintShopSettingsPage"].concat(o,i),function(e){return new e({initialTab:a.query.tab})})})});