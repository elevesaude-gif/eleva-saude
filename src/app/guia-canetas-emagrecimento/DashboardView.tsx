"use client";

import {BrandLogo} from "@/components/brand/BrandLogo";
import type {DashboardContent,DashboardProduct} from "@/lib/dashboard-content";
import Image from "next/image";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import styles from "./dashboard.module.css";

type ViewMode="product"|"family";

function ProductArt({product}:{product:DashboardProduct}){
  return product.image_url?(
    <span className={styles.imageFrame}><Image src={product.image_url} alt={`Imagem de ${product.name}`} fill sizes="(max-width: 620px) 100vw, 380px" className={styles.productImage} unoptimized/></span>
  ):(<div className={styles.placeholder}><span>{product.name.slice(0,2).toUpperCase()}</span><small>eLeve Saúde</small></div>);
}

function PurchaseAction({product}:{product:DashboardProduct}){
  return product.buy_url?<button className={styles.buyButton} type="button" onClick={()=>window.location.assign(product.buy_url)}>Quero Comprar</button>:<button className={styles.disabledButton} type="button" disabled>Em breve</button>;
}

function ProductModal({product,onClose}:{product:DashboardProduct;onClose:()=>void}){
  const closeButtonRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const previousOverflow=document.body.style.overflow;
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};
    document.addEventListener("keydown",closeOnEscape);
    document.body.style.overflow="hidden";
    closeButtonRef.current?.focus();
    return()=>{document.removeEventListener("keydown",closeOnEscape);document.body.style.overflow=previousOverflow};
  },[onClose]);
  return <div className={styles.backdrop} role="presentation" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-title">
      <button ref={closeButtonRef} className={styles.close} type="button" onClick={onClose} aria-label="Fechar detalhes">×</button>
      <div className={styles.modalTop}><ProductArt product={product}/><div><p className={styles.kicker}>Família científica: {product.scientific_family}</p><h2 id="product-title">{product.name}</h2><p>{product.pitch}</p><div className={styles.tags}>{product.category&&<span>{product.category}</span>}<span>{product.level}</span></div></div></div>
      <div className={styles.detailGrid}><div><h3>Apresentação</h3><p>{product.presentation}</p></div><div><h3>Para que é estudado</h3><p>{product.studied_for}</p></div><div><h3>O que a pesquisa mostra</h3><p>{product.research_shows}</p></div><div className={styles.important}><h3>Importante não confundir</h3><p>{product.important_note}</p></div></div>
      <PurchaseAction product={product}/>
    </section>
  </div>;
}

function ProductCard({product,onOpen}:{product:DashboardProduct;onOpen:(product:DashboardProduct)=>void}){
  return <article className={styles.card}><div className={styles.artWrap}><ProductArt product={product}/><span className={styles.level} data-level-class={product.level_class}>{product.level}</span></div><div className={styles.cardBody}>{product.category&&<p className={styles.category}>{product.category}</p>}<h3>{product.name}</h3><p className={styles.presentation}>{product.presentation}</p><p>{product.short_summary}</p><div className={styles.cardActions}><button className={styles.learnButton} type="button" onClick={event=>{event.preventDefault();event.stopPropagation();onOpen(product)}}>Entender esta opção</button><PurchaseAction product={product}/></div></div></article>;
}

export function DashboardView({content}:{content:DashboardContent}){
  const [query,setQuery]=useState("");
  const [activeGoal,setActiveGoal]=useState<string|null>(null);
  const [mode,setMode]=useState<ViewMode>("product");
  const [selectedProduct,setSelectedProduct]=useState<DashboardProduct|null>(null);
  const productsRef=useRef<HTMLElement>(null);
  const closeModal=useCallback(()=>{
    setSelectedProduct(null);
  },[]);
  const openProduct=useCallback((product:DashboardProduct)=>{
    setSelectedProduct(product);
  },[]);
  const products=useMemo(()=>{
    const normalizedQuery=query.trim().toLocaleLowerCase("pt-BR");
    return content.products.filter(product=>{
      if(activeGoal&&!product.goal_slugs.includes(activeGoal))return false;
      if(!normalizedQuery)return true;
      return [product.name,product.scientific_family,product.category,product.presentation,product.short_summary,product.pitch,product.studied_for,product.research_shows,product.important_note].some(value=>value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    });
  },[activeGoal,content.products,query]);
  const familyGroups=useMemo(()=>{
    const groups=new Map<string,DashboardProduct[]>();
    for(const product of products)groups.set(product.scientific_family,[...(groups.get(product.scientific_family)??[]),product]);
    return Array.from(groups.entries());
  },[products]);
  const chooseGoal=(slug:string)=>{
    setActiveGoal(current=>current===slug?null:slug);setQuery("");
    window.requestAnimationFrame(()=>productsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));
  };
  const changeSearch=(value:string)=>{setQuery(value);if(value)setActiveGoal(null)};
  if(!content.settings.active)return <main className={styles.offline}><BrandLogo/><h1>Esta página está temporariamente indisponível.</h1><p>Fale com a equipe eLeve Saúde para saber mais.</p></main>;
  return <main className={styles.page}>
    <header className={styles.header}><BrandLogo size="small"/><span>Guia de tratamentos</span></header>
    <section className={styles.hero}><div className={styles.orb}/><div className={styles.heroInner}><p className={styles.kicker}>{content.settings.subtitle}</p><h1>{content.settings.title}</h1><p className={styles.heroText}>{content.settings.hero_text}</p><label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event=>changeSearch(event.target.value)} placeholder="Busque por nome, família ou apresentação" aria-label="Buscar tratamentos"/></label><p className={styles.support}>{content.settings.support_text}</p></div></section>
    <section className={styles.content}>
      <div className={styles.goalHeader}><div><p className={styles.kicker}>Escolha seu foco</p><h2>Qual é o seu objetivo?</h2></div><p>{content.settings.audit_text} · {content.products.length} opções</p></div>
      <div className={styles.goals}>{content.goals.map(item=><button type="button" key={item.slug} onClick={()=>chooseGoal(item.slug)} aria-pressed={activeGoal===item.slug} className={activeGoal===item.slug?styles.activeGoal:""}><b>{item.icon}</b><span>{item.title}</span><small>{item.description}</small></button>)}</div>
      <section ref={productsRef} className={styles.results}>
        <div className={styles.resultBar}><strong>{products.length} {products.length===1?"opção encontrada":"opções encontradas"}</strong><div className={styles.resultActions}>{(query||activeGoal)&&<button type="button" onClick={()=>{setQuery("");setActiveGoal(null)}}>Limpar filtros</button>}<div className={styles.switches} aria-label="Modo de visualização"><button type="button" aria-pressed={mode==="product"} className={mode==="product"?styles.activeSwitch:""} onClick={()=>setMode("product")}>Produtos</button><button type="button" aria-pressed={mode==="family"} className={mode==="family"?styles.activeSwitch:""} onClick={()=>setMode("family")}>Famílias</button></div></div></div>
        {mode==="product"?familyGroups.map(([family,familyProducts])=><section key={family} className={styles.family}><div className={styles.familyHeading}><span/><div><p>Família científica</p><h2>{family}</h2></div></div><div className={styles.grid}>{familyProducts.map(product=><ProductCard key={product.slug} product={product} onOpen={openProduct}/>)}</div></section>):<div className={styles.familyGrid}>{familyGroups.map(([family,familyProducts])=>{const representative=familyProducts[0];return <article className={styles.familyCard} key={family}><div className={styles.familyArt}>{familyProducts.slice(0,4).map(product=><div key={product.slug}><ProductArt product={product}/></div>)}</div><div><span className={styles.familyCount}>{familyProducts.length} {familyProducts.length===1?"apresentação":"apresentações"}</span><h3>{family}</h3><p>{representative.short_summary}</p><button className={styles.learnButton} type="button" onClick={()=>openProduct(representative)}>Entender a família</button></div></article>})}</div>}
        {products.length===0&&<div className={styles.empty}><b>Nenhuma opção encontrada.</b><p>Tente outro termo ou limpe os filtros.</p></div>}
      </section>
      {content.sections.map(section=><section className={styles.extra} key={section.id??section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
      <section className={styles.faq}><p className={styles.kicker}>Perguntas frequentes</p><h2>Antes de seguir</h2>{content.questions.map(question=><details key={question.id??question.question}><summary>{question.question}<span>＋</span></summary><p>{question.answer}</p></details>)}</section>
    </section>
    <footer className={styles.footer}><BrandLogo size="small"/><p>Informação clara para decisões mais conscientes.</p></footer>
    {selectedProduct&&<ProductModal product={selectedProduct} onClose={closeModal}/>} 
  </main>;
}
