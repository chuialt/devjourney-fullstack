'use client';
import Link from 'next/link';
import { Icon } from './icons';
import { type Item, type Stage } from '@/lib/types';

export function HeroArt({variant = 'home'}: {variant?: 'home' | 'paths' | 'instructor'}) {
  return <div className={`hero-art hero-art-${variant}`} aria-hidden="true">
    <svg viewBox="0 0 530 250" preserveAspectRatio="xMidYMax meet" role="img">
      <defs><linearGradient id="skyhill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#B9D2FA"/><stop offset="1" stopColor="#8CACDE"/></linearGradient><linearGradient id="frontHill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6BA18C"/><stop offset="1" stopColor="#1E6A71"/></linearGradient></defs>
      <circle cx="417" cy="62" r="37" fill="#FDE8B5" opacity=".86"/>
      <path d="M0 172 89 73 151 140 233 53 319 157 409 71 530 173V250H0z" fill="#D5E4FE"/>
      <path d="m58 190 112-116 99 109 62-88 120 99 79-73v129H0z" fill="url(#skyhill)"/>
      <path d="m134 116 36-42 38 45-30-13-16 17zM310 128l21-33 22 31-21-11z" fill="#F5FAFF" opacity=".94"/>
      <path d="M0 207c85-54 140-14 211-32s140-41 319 27v48H0z" fill="#86B8AF"/>
      <path d="M0 231c127-43 178-25 270-16s160-42 260-16v51H0z" fill="url(#frontHill)"/>
      <path d="M330 250c-3-30 14-35 30-46s15-18 9-27 8-17 20-22" stroke="#FAD8A0" strokeWidth="13" fill="none" strokeLinecap="round"/>
      <path d="M330 250c-3-30 14-35 30-46s15-18 9-27 8-17 20-22" stroke="#FFF0CD" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M386 156v-57" stroke="#173F64" strokeWidth="4"/><path d="M388 99q17-8 31 0l-3 20q-12-8-28 0z" fill="#F38B6A"/>
      <path d="M34 230 51 179l17 51zm39-3 14-51 19 51zm374 9 21-66 19 66zm52 1 12-43 12 43z" fill="#285F65"/><path d="M47 198h10M88 194h9M470 194h10" stroke="#F5FFF7" opacity=".45"/>
    </svg>
  </div>;
}
export function SectionHeading({kicker, title, subtitle, action, href}: {kicker?: string; title: string; subtitle?: string; action?: string; href?: string}) {
  return <div className="section-heading"><div>{kicker && <span className="eyebrow">{kicker}</span>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && href && <Link className="link-arrow" href={href}>{action}<Icon name="arrow" size={17}/></Link>}</div>;
}
export function ProgressBar({value, accent = 'blue'}: {value: number; accent?: string}) {
  return <div className="progress-track"><div className={`progress-fill fill-${accent}`} style={{width: `${Math.max(0, Math.min(100, value))}%`}}/></div>;
}
export function ItemCard({item, compact = false}: {item: Item; compact?: boolean}) {
  return <Link href={`/${item.kind === 'course' ? 'courses' : 'missions'}/${item.slug}`} className={`item-card ${compact ? 'item-compact' : ''}`}>
    <span className={`item-icon ${item.kind === 'course' ? 'item-course' : 'item-mission'}`}><Icon name={item.icon} size={23}/></span>
    <span className="item-body"><span className="item-kind">{item.kind === 'course' ? 'MINI-COURSE' : 'INTERACTIVE MISSION'}</span><strong>{item.title}</strong>{!compact && <span className="item-summary">{item.summary}</span>}<span className="item-meta"><Icon name="clock" size={13}/>{item.minutes} min <span>•</span><Icon name="trophy" size={13}/>{item.xp} XP</span></span>
    {item.completed ? <span className="item-done"><Icon name="check" size={15}/></span> : <Icon name="chevron" size={18} className="item-chevron"/>}
  </Link>;
}
export function RoadmapCard({stage, index, last = false}: {stage: Stage; index: number; last?: boolean}) {
  const pct = stage.total ? Math.round(100 * stage.completed / stage.total) : 0;
  return <div className={`roadmap-row ${last ? 'last-row' : ''}`}>
    <div className="roadmap-node"><span className={`stage-node node-${stage.accent}`}>{String(index + 1).padStart(2, '0')}</span></div>
    <div className="roadmap-stage"><div className="stage-summary"><span className={`stage-icon tile-${stage.accent}`}><Icon name={stage.icon} size={24}/></span><div className="stage-details"><div className="stage-title-line"><h3>{stage.title}</h3>{pct === 100 && <span className="finished-badge"><Icon name="check" size={12}/> Complete</span>}</div><p>{stage.description}</p><div className="stage-progress"><ProgressBar value={pct} accent={stage.accent}/><span>{stage.completed}/{stage.total} completed</span></div></div></div>
    <div className="stage-items">{stage.items.slice(0, 2).map(item => <ItemCard key={item.slug} item={item} compact/>)}</div></div>
  </div>;
}
export function StatCard({icon, value, label, color = 'blue', note}: {icon: string; value: string | number; label: string; color?: string; note?: string}) {
  return <div className="stat-card"><span className={`stat-icon tile-${color}`}><Icon name={icon} size={21}/></span><div><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div></div>;
}
