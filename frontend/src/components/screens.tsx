'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useData } from './provider';
import { HeroArt, ItemCard, ProgressBar, RoadmapCard, SectionHeading, StatCard } from './ui';
import { Icon } from './icons';
import type { Item } from '@/lib/types';

export function DashboardScreen() {
  const {data} = useData();
  if (!data) return null;
  const {learner, stages, paths, items} = data;
  const upcoming = items.filter(item => !item.completed).slice(0, 2);
  const chosenPath = paths.find(p => p.slug === learner.path);
  return <>
    <section className="hero">
      <div><span className="eyebrow">YOUR JOURNEY STARTS HERE</span><h1>Learn. Build.<br/><span style={{color:'#376fea'}}>Play.</span> <span style={{color:'#12a57d'}}>Grow.</span></h1><p>Your next chapter in tech begins here. Learn the fundamentals, take on real-world challenges, and build skills that matter.</p><div className="hero-actions"><Link className="btn btn-primary" href="/roadmap">Continue journey <Icon name="arrow" size={16}/></Link><Link className="btn btn-outline" href="/paths">Explore paths</Link></div></div><HeroArt/>
    </section>
    <SectionHeading kicker="AT A GLANCE" title={`Welcome back, ${learner.name.split(' ')[0]}!`} subtitle="Small steps add up. Here's how your journey is going."/>
    <div className="stats-row"><StatCard icon="chart" value={`${learner.progress}%`} label="Journey completed" color="blue"/><StatCard icon="trophy" value={learner.xp.toLocaleString()} label="Experience points" color="amber"/><StatCard icon="fire" value={learner.streak} label="Day learning streak" color="orange"/><StatCard icon="check" value={learner.completed} label="Activities finished" color="green"/></div>
    <div className="dashboard-grid">
      <div className="dashboard-main"><div className="card"><div className="card-pad" style={{paddingBottom:0}}><div className="mini-section-title"><div><h2>Your learning roadmap</h2><p>Follow the milestones on your way to a tech career.</p></div><Link href="/roadmap" className="link-arrow">Full roadmap <Icon name="arrow" size={16}/></Link></div></div><div className="roadmap-list">{stages.slice(0, 4).map((s,i) => <RoadmapCard key={s.id} stage={s} index={i} last={i===3}/>)}</div></div></div>
      <div className="dashboard-side">
        <div className="card card-pad"><div className="mini-section-title"><h2>My progress</h2><Icon name="chart" size={19}/></div><div className="progress-mini"><div className="progress-ring" style={{'--val':learner.progress} as CSSProperties}><span>{learner.progress}%</span></div></div><div className="ring-label">Overall journey progress</div><div className="badge-earned"><Icon name="trophy" size={29}/><div><strong style={{fontSize:12}}>On your way!</strong><p style={{margin:'4px 0 0',fontSize:10}}>Keep learning to earn your next badge.</p></div></div></div>
        <div className="callout-card"><span className="eyebrow">YOUR CURRENT PATH</span><h3>{chosenPath?.title || 'Choose your journey'}</h3><p>{chosenPath?.subtitle || 'Choose a career to personalise your roadmap.'}</p><Link href="/paths" className="link-arrow">Manage career path <Icon name="arrow" size={16}/></Link><Icon name={chosenPath?.icon || 'flag'} size={110} className="icon-large"/></div>
        <div className="card card-pad"><h3 style={{marginBottom:13}}>Learning with purpose</h3><p style={{fontSize:12,lineHeight:1.8,margin:0}}>Different backgrounds, same opportunities. Your course content and AI hints can adapt to your learning goals.</p><span className="pill pill-purple" style={{marginTop:13}}>{learner.background === 'cs' ? 'CS learner' : 'Non-CS learner'}</span></div>
      </div>
    </div>
    <SectionHeading kicker="RECOMMENDED NEXT" title="Keep the momentum going" subtitle="Pick up where you left off, or try something new." action="See all activities" href="/courses"/>
    <div className="catalog-grid">{upcoming.map(item => <ItemCard key={item.id} item={item}/>)}<Link href="/missions" className="item-card" style={{background:'linear-gradient(120deg,#f0ebff,#f8f6ff)',borderColor:'#e7dcff',flexDirection:'column'}}><span className="item-icon item-mission"><Icon name="gamepad" size={24}/></span><span className="item-body"><span className="item-kind">TRY SOMETHING DIFFERENT</span><strong style={{fontSize:15}}>Explore mini-games</strong><span className="item-summary">Practise your skills through realistic challenges and decision-making.</span><span className="link-arrow" style={{marginTop:12}}>Browse missions <Icon name="arrow" size={15}/></span></span></Link></div>
  </>;
}

export function RoadmapScreen() {
  const {data} = useData();
  if (!data) return null;
  const path = data.paths.find(p => p.slug === data.active_path);
  return <><div className="page-header"><div><span className="eyebrow" style={{marginBottom:9}}>YOUR CAREER ADVENTURE</span><h1 className="page-title">My Learning Roadmap</h1><p className="page-description">Learn at your own pace. Complete courses and missions to unlock new skills.</p></div><Link href="/paths" className="btn btn-outline"><Icon name="flag" size={16}/> Change career path</Link></div>
    <div className="hero hero-small"><div><span className="eyebrow">CURRENT JOURNEY</span><h1>{path?.title}</h1><p>{path?.subtitle}. Your own timeline, your own pace.</p><div className="hero-chips"><span>{data.stages.length} stages</span><span>{data.items.length} activities</span><span>{data.learner.progress}% completed</span></div></div><HeroArt variant="paths"/></div>
    <SectionHeading kicker="THE JOURNEY" title="Your milestones" subtitle="Every step combines bite-sized courses with hands-on games."/>
    <div className="card"><div className="roadmap-list">{data.stages.map((s,i) => <RoadmapCard key={s.id} stage={s} index={i} last={i===data.stages.length-1}/>)}</div></div>
    <div className="demo-message" style={{marginTop:17}}>This prototype allows learners to open any stage. A future version could make milestones unlock after prerequisites.</div>
  </>;
}

export function PathsScreen() {
  const {data, updateLearner} = useData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!data) return null;
  const selectedPath = data.learner.path;
  const setValue = async (field: 'path' | 'background', value: string) => {
    setBusy(true); setError('');
    try { await updateLearner({[field]:value}); }
    catch(e) { setError(e instanceof Error ? e.message : 'Could not save'); }
    finally { setBusy(false); }
  };
  return <><div className="hero hero-small"><div><span className="eyebrow">EVERY GREAT CAREER STARTS SOMEWHERE</span><h1>Choose <span className="accent-word">your journey.</span></h1><p>Start with shared foundations, then grow into the role that fits your interests and career goals.</p></div><HeroArt variant="paths"/></div>
    <SectionHeading title="First, tell us about yourself" subtitle="Your learning background shapes the level of guidance you receive."/>
    <div className="card onboarding"><div className="option-label">HOW FAMILIAR ARE YOU WITH CODING?</div><div className="choice-row"><button disabled={busy} className={`choice ${data.learner.background==='non_cs'?'active':''}`} onClick={() => void setValue('background','non_cs')}><Icon name="sprout" size={20}/> New to tech / non-CS learner {data.learner.background==='non_cs'&&<Icon name="check" size={16}/>}</button><button disabled={busy} className={`choice ${data.learner.background==='cs'?'active':''}`} onClick={() => void setValue('background','cs')}><Icon name="code" size={20}/> CS graduate / experienced learner {data.learner.background==='cs'&&<Icon name="check" size={16}/>}</button></div><p style={{margin:'14px 0 0'}}>Both options cover the same core skills. Beginners receive more context, while experienced learners receive more challenging exercises.</p>{error && <div className="error-message">{error}</div>}</div>
    <SectionHeading kicker="CHOOSE A DIRECTION" title="Where do you want to grow?" subtitle="The common foundation connects every career path."/>
    <div className="branch-content"><div className="card foundation"><span className="stage-icon tile-purple"><Icon name="layers" size={26}/></span><h3 style={{marginTop:17}}>Common foundations</h3><p>Essential skills for anyone entering software development.</p><div className="foundation-points">{['How software gets built','Programming fundamentals','Git and collaboration','Agile teamwork','AI coding fluency'].map(x => <div key={x}><Icon name="check" size={17}/>{x}</div>)}</div><div className="pill pill-green" style={{marginTop:30}}>Shared by all pathways</div></div>
      <div className="path-cards">{data.paths.map(p => <div key={p.slug} className={`path-card ${p.accent==='orange'?'orange':''}`}><div className="path-illustration"><Icon name={p.icon} size={65} strokeWidth={1.25}/></div><div className="path-card-body"><span className="eyebrow">CAREER TRACK</span><h3>{p.title}</h3><p>{p.description}</p><div className="path-tags">{(p.slug==='developer'?['Coding','Testing','Debugging','AI tools']:['Agile','Facilitation','Teamwork','Leadership']).map(t=><span className="path-tag" key={t}>{t}</span>)}</div><div className="path-card-footer"><span style={{fontSize:11,color:'#7c8cac'}}>{p.slug === 'developer' ? 'Build great software products' : 'Help teams deliver more value'}</span>{selectedPath===p.slug?<Link className="btn btn-primary" href="/roadmap">Current path <Icon name="arrow" size={15}/></Link>:<button disabled={busy} onClick={()=>void setValue('path',p.slug)} className={`btn ${p.accent==='orange'?'btn-orange':'btn-primary'}`}>Choose path <Icon name="arrow" size={15}/></button>}</div></div></div>)}</div>
    </div>
    <div className="demo-message" style={{marginTop:16}}>More career paths can be added later, such as QA Tester, Product Owner or UX Designer.</div>
  </>;
}

export function CatalogScreen({kind}: {kind: 'course'|'mission'}) {
  const {data} = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all'|'todo'|'done'>('all');
  const shown = useMemo(() => (data?.items || []).filter(i => i.kind===kind &&
      (filter==='all'||(filter==='done' ? i.completed : !i.completed)) &&
      (i.title+' '+i.summary+' '+i.tags.join(' ')).toLowerCase().includes(query.toLowerCase())),[data,kind,filter,query]);
  return <><div className="page-header"><div><span className="eyebrow" style={{marginBottom:9}}>{kind==='course'?'LEARN THE ESSENTIALS':'PRACTISE BY DOING'}</span><h1 className="page-title">{kind==='course'?'Mini-courses':'Interactive Missions'}</h1><p className="page-description">{kind==='course'?'Short, focused lessons designed for your next career step.':'Learn by making decisions and solving real software engineering problems.'}</p></div><span className={`pill ${kind==='course'?'':'pill-purple'}`}>{data?.items.filter(i=>i.kind===kind).length ?? 0} {kind==='course'?'courses':'missions'}</span></div>
    <div className="hero hero-small"><div><span className="eyebrow">{kind==='course'?'BITE-SIZED LEARNING':'GAMIFIED PRACTICE'}</span><h1>{kind==='course'?'Your next skill starts here.':'Turn knowledge into action.'}</h1><p>{kind==='course'?'Learn the why behind the tools, from software fundamentals to AI-assisted development.':'Earn XP, solve problems, and test your professional judgement in realistic scenarios.'}</p></div><HeroArt/></div>
    <div className="catalog-controls"><label className="search-input"><Icon name="search" size={17}/><input placeholder={`Search ${kind==='course'?'courses':'missions'}...`} value={query} onChange={e=>setQuery(e.target.value)} /></label><div className="tab-buttons">{([['all','All'],['todo','Not started'],['done','Completed']] as const).map(([key,label])=><button className={filter===key?'selected':''} key={key} onClick={()=>setFilter(key)}>{label}</button>)}</div></div>
    {shown.length ? <div className="catalog-grid">{shown.map(item=><ItemCard key={item.id} item={item}/>)}</div> : <div className="empty-state"><Icon name="search" size={30}/><h3>No matching activities</h3><p>Try another search or filter.</p></div>}
  </>;
}

export function ProgressScreen() {
  const {data} = useData();
  if (!data) return null;
  const l = data.learner;
  return <><div className="page-header"><div><span className="eyebrow" style={{marginBottom:9}}>EVERY STEP COUNTS</span><h1 className="page-title">Your Learning Progress</h1><p className="page-description">A closer look at the skills and milestones you are building.</p></div></div>
    <div className="stats-row"><StatCard icon="chart" value={`${l.progress}%`} label="Path progress" color="blue"/><StatCard icon="check" value={l.completed} label="Completed activities" color="green"/><StatCard icon="trophy" value={l.xp} label="Experience points" color="amber"/><StatCard icon="fire" value={l.streak} label="Day streak" color="orange"/></div>
    <div className="progress-panels"><div className="card" style={{textAlign:'center'}}><span className="eyebrow" style={{marginBottom:20}}>OVERALL JOURNEY</span><div className="progress-ring" style={{width:176,height:176,'--val':l.progress} as CSSProperties}><span style={{fontSize:37}}>{l.progress}%</span></div><h3 style={{marginTop:22}}>Keep exploring!</h3><p style={{fontSize:12}}>You&apos;ve completed {l.completed} of {l.total} activities in your current learning path.</p><Link href="/roadmap" className="btn btn-primary" style={{marginTop:9}}>Continue learning <Icon name="arrow" size={16}/></Link></div>
      <div className="card"><div className="mini-section-title"><div><h2>Milestone progress</h2><p>Your stage-by-stage growth.</p></div></div><div className="timeline-progress">{data.stages.map(s=><div key={s.id} className="progress-step"><span className={`stage-icon tile-${s.accent}`}><Icon name={s.icon} size={19}/></span><div><strong>{s.title}</strong><small>{s.completed}/{s.total} complete</small><ProgressBar value={s.total?100*s.completed/s.total:0} accent={s.accent}/></div></div>)}</div></div></div>
    <SectionHeading title="Achievement collection" subtitle="More badges become available as you complete missions."/>
    <div className="achievement-grid"><div className="achievement"><span className="tile-purple"><Icon name="sprout" size={28}/></span><strong>First Steps</strong><p>Begin your learning journey</p></div><div className={`achievement ${l.completed<4?'locked':''}`}><span className="tile-amber"><Icon name="trophy" size={28}/></span><strong>Knowledge Seeker</strong><p>Complete four activities</p></div><div className={`achievement ${l.completed<8?'locked':''}`}><span className="tile-blue"><Icon name="shield" size={28}/></span><strong>Problem Solver</strong><p>Complete eight activities</p></div></div>
  </>;
}
