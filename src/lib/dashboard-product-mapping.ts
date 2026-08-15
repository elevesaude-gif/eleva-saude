import type {DashboardContent,DashboardProduct} from "@/lib/dashboard-content";
import type {Product,SellerSlug} from "@/types/checkout";

const sellerPathPattern=/^\/(?:caio|isabela|bruno)(?=\/|\?|$)/;
const checkoutSlugByDashboardSlug:Record<string,string>={
 tg15:"tg-15",tirzec4:"tirzec-4-ampolas",tirzegen:"tirzegen",tirzec15:"tirzec-15",lipoless60:"lipoless",gluconex:"gluconex",tirzedral:"tirzedral",tirzedralmd:"tirzedral-md",lipoland:"lipoland",
 reta40:"retatrutida-40mg",reta40x4:"retatrutida-40mg-4-ampolas",reta80:"retatrutida-80mg",reta120:"retatrutida-120mg",reta160:"retatrutida-160mg",tesa:"tesamorelin-10mg",ghk100d:"ghk-cu-100mg",glow:"glow-70mg",klow:"klow-80mg",pt141:"pt-141-10mg",cbl:"cbl-514",slu:"slu-pp-33-5mg",hgh:"hgh-frag",semax:"semax",aod:"aod-5mg",cjcipa:"cjc-1295-ipamorelin-10mg",ipa:"ipamorelin-10mg",mots:"mots-c-10mg",ss31:"ss-31-10mg",tb:"tb-500-bpc-157-20mg",nad:"nad-500mg",ghk100po:"ghk-cu-100mg-po",ghk50:"ghk-cu-50mg",ghk50lio:"ghk-cu-50mg-po-liofilizado"
};

export function normalizeProductName(value:string){
 return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").replace(/\bmg\b/g,"mg").replace(/[^a-z0-9+]+/g," ").trim();
}

export function mapDashboardProducts(content:DashboardContent,catalog:Product[],seller:SellerSlug):DashboardContent{
 const checkoutByName=new Map(catalog.map(product=>[normalizeProductName(product.name),product]));
 const checkoutBySlug=new Map(catalog.flatMap(product=>[product.slug,product.id].filter((value):value is string=>Boolean(value)).map(value=>[value,product] as const)));
 return {...content,products:content.products.map(product=>enrichProduct(product,checkoutBySlug.get(checkoutSlugByDashboardSlug[product.slug])??checkoutByName.get(normalizeProductName(product.name)),seller))};
}

function enrichProduct(product:DashboardProduct,checkoutProduct:Product|undefined,seller:SellerSlug):DashboardProduct{
 const configuredUrl=product.buy_url.trim();
 let buyUrl=configuredUrl.replaceAll("{seller}",seller);
 if(buyUrl&&sellerPathPattern.test(buyUrl))buyUrl=buyUrl.replace(sellerPathPattern,`/${seller}`);
 if(!buyUrl&&checkoutProduct)buyUrl=`/${seller}?product=${encodeURIComponent(checkoutProduct.id)}`;
 return {...product,image_url:product.image_url||checkoutProduct?.image||"",buy_url:buyUrl};
}
