define(["../core/Collection","./PressWorksheet"],function(e,r){return e.extend({model:r,rqlQuery:"exclude(orders,operators)&sort(-date)&limit(15)"})});