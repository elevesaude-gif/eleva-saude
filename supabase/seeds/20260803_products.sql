-- Não reaplicar em produção após edições pelo CMS sem revisão.
-- Importação inicial idempotente: ON CONFLICT atualiza campos editáveis e pode sobrescrever o CMS.
insert into public.products (id,slug,name,description,category,price_cents,image_url,image_alt,requires_shipping,weight_grams,height_cm,width_cm,length_cm,insured_value_cents,sort_order,active) values
('tirzec-15','tirzec-15','Tirzec 15','Apresentação multidose de 60mg em 2mL.','Tirzepatida',62500,'/products/tirzec-15.webp','Tirzec 15',true,300,8,16,22,62500,1,true),
('tirzec-4-ampolas','tirzec-4-ampolas','Tirzec 4 Ampolas','4 ampolas de tirzepatida 15mg/0,5mL.','Tirzepatida',85000,'/products/tirzec-4-ampolas.webp','Tirzec 4 Ampolas',true,300,8,16,22,85000,2,true),
('tg-15','tg-15','T.G 15','4 ampolas de tirzepatida 15mg.','Tirzepatida',89000,'/products/tg-15.webp','T.G 15',true,300,8,16,22,89000,3,true),
('lipoless','lipoless','Lipoless','Frasco multidose com 60mg de tirzepatida em 2,4mL.','Tirzepatida',72000,'/products/lipoless.webp','Lipoless',true,300,8,16,22,72000,4,true),
('tirzegen','tirzegen','Tirzegen','Tirzepatida 60mg com 2mL de água bacteriostática.','Tirzepatida',75000,'/products/tirzegen.webp','Tirzegen',true,300,8,16,22,75000,5,true),
('gluconex','gluconex','Gluconex','4 ampolas de tirzepatida 15mg/1mL.','Tirzepatida',89000,'/products/gluconex.webp','Gluconex',true,300,8,16,22,89000,6,true),
('tirzedral','tirzedral','Tirzedral','4 ampolas de 15mg/0,5mL.','Tirzepatida',95000,'/products/tirzedral.webp','Tirzedral',true,300,8,16,22,95000,7,true),
('tirzedral-md','tirzedral-md','Tirzedral MD','Ampola multidose de 60mg.','Tirzepatida',95000,'/products/tirzedral-md.webp','Tirzedral MD',true,300,8,16,22,95000,8,true),
('lipoland','lipoland','Lipoland','Apresentação multidose de 60mg em 2mL.','Tirzepatida',95000,'/products/lipoland.webp','Lipoland',true,300,8,16,22,95000,9,true)
on conflict (id) do update set slug=excluded.slug,name=excluded.name,description=excluded.description,category=excluded.category,price_cents=excluded.price_cents,image_url=excluded.image_url,image_alt=excluded.image_alt,requires_shipping=excluded.requires_shipping,weight_grams=excluded.weight_grams,height_cm=excluded.height_cm,width_cm=excluded.width_cm,length_cm=excluded.length_cm,insured_value_cents=excluded.insured_value_cents,sort_order=excluded.sort_order;
