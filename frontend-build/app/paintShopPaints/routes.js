define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(a,p,e,i,n){"use strict";var t="i18n!app/nls/paintShopPaints",o=i.auth("PAINT_SHOP:VIEW"),s=i.auth("PAINT_SHOP:MANAGE");p.map("/paintShop/paints/:id",o,function(a){e.loadPage(["app/core/pages/DetailsPage","app/paintShopPaints/PaintShopPaint","app/paintShopPaints/templates/details",t],function(p,e,i){return new p({pageClassName:"page-max-flex",baseBreadcrumb:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),model:new e({_id:a.params.id}),detailsTemplate:i})})}),p.map("/paintShop/paints;add",s,function(){e.loadPage(["app/core/pages/AddFormPage","app/paintShopPaints/PaintShopPaint","app/paintShopPaints/views/PaintShopPaintFormView",t],function(a,p,e){return new a({pageClassName:"page-max-flex",baseBreadcrumb:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),FormView:e,model:new p})})}),p.map("/paintShop/paints/:id;edit",s,function(a){e.loadPage(["app/core/pages/EditFormPage","app/paintShopPaints/PaintShopPaint","app/paintShopPaints/views/PaintShopPaintFormView",t],function(p,e,i){return new p({pageClassName:"page-max-flex",baseBreadcrumb:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),FormView:i,model:new e({_id:a.params.id})})})}),p.map("/paintShop/paints/:id;delete",s,a.partial(n,"app/paintShopPaints/PaintShopPaint",a,a,{baseBreadcrumb:!0}))});