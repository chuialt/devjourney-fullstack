'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useData } from './provider';
import { HeroArt, ProgressBar, SectionHeading, StatCard } from './ui';
import { Icon } from './icons';
import { api, type ItemDetail } from '@/lib/types';
import { useParams } from 'next/navigation';

export function InstructorScreen() {
  const {data} = useData();
  if(!data)return null;
  const metrics=data.instructor;
  return <><section className="hero hero-small"><div><span className="eyebrow">INSTRUCTOR WORKSPACE</span><h1>Inspire. Assign.<br/><span className="accent-word">Empower.</span></h1><p>Guide every learner's journey. Create engaging activities, assign mini-courses and track progress in one place.</p></div><HeroArt variant="instructor"/></section>
    <SectionHeading kicker="YOUR CLASSROOM" title="A snapshot of your learning community" subtitle="Monitor participation and see where your students need support."/>
    <div className="stats-row"><StatCard icon="users" value={metrics.total_students} label="Demo students" color="green"/><StatCard icon="chart" value={`${metrics.average_progress}%`} label="Average progress" color="blue"/><StatCard icon="check" value={metrics.total_completions} label="Activities completed" color="purple"/><StatCard icon="book" value={metrics.assignments.length} label="Active assignments" color="amber"/></div>
    <SectionHeading title="What would you like to do?"/>
    <div className="instructor-actions"><div className="action-card"><span className="action-card-icon"><Icon name="book" size={23}/></span><h3>Assign an activity</h3><p>Choose a mini-course or mission for your students.</p><Link className="btn btn-primary btn-full" href="/instructor/assignments">Manage assignments <Icon name="arrow" size={16}/></Link></div><div className="action-card purple"><span className="action-card-icon"><Icon name="gamepad" size={23}/></span><h3>Browse missions</h3><p>Preview the hands-on experiences available to learners.</p><Link className="btn btn-purple btn-full" href="/missions">Explore missions <Icon name="arrow" size={16}/></Link></div><div className="action-card orange"><span className="action-card-icon"><Icon name="sparkles" size={23}/></span><h3>Create a mini-course</h3><p>Use AI or an offline template to draft editable lessons.</p><Link className="btn btn-orange btn-full" href="/instructor/create">Open course studio <Icon name="arrow" size={16}/></Link></div></div>
    <div className="instructor-grid"><div className="card"><div className="mini-section-title"><div><h2>Assigned learning</h2><p>Activities available to your demo classes.</p></div><Link className="link-arrow" href="/instructor/assignments">View all <Icon name="arrow" size={15}/></Link></div>{metrics.assignments.map(a=><div className="assignment-row" key={a.id}><span className={`item-icon ${a.kind==='course'?'item-course':'item-mission'}`}><Icon name={a.kind==='course'?'book':'gamepad'} size={20}/></span><div><strong>{a.item}</strong><span>{a.audience} · {a.kind==='course'?'Mini-course':'Interactive mission'}</span></div><span className="pill pill-green">Assigned</span></div>)}{!metrics.assignments.length&&<p>No assignments yet.</p>}</div>
      <div className="card"><div className="mini-section-title"><div><h2>Teaching insights</h2><p>Illustrative suggestions, not AI-generated analytics.</p></div><Icon name="sparkles" size={20}/></div><div className="insight"><Icon name="users" size={22}/><div><strong>Different starting points</strong><p>Offer beginner-friendly explanations alongside practical advanced exercises.</p></div></div><div className="insight orange"><Icon name="target" size={22}/><div><strong>Use milestone challenges</strong><p>Reinforce the Scrum and Git units with interactive missions.</p></div></div><div className="insight green"><Icon name="chart" size={22}/><div><strong>Review learner outcomes</strong><p>Check completion data and follow up with learners who need additional help.</p></div></div></div></div>
    <SectionHeading kicker="LEARNER OVERVIEW" title="Student progress" subtitle="Demo learners in your classroom." action="Assign more activities" href="/instructor/assignments"/>
    <div id="students" className="card table-wrapper"><table><thead><tr><th>STUDENT</th><th>CAREER PATH</th><th>COMPLETED</th><th>PROGRESS</th></tr></thead><tbody>{metrics.students.map(s=><tr key={s.name}><td><div className="student-cell"><span className="table-avatar">{s.initials}</span>{s.name}</div></td><td>{s.path}</td><td>{s.completed} activities</td><td><div className="table-progress"><strong>{s.progress}%</strong><ProgressBar value={s.progress} accent={s.progress>60?'green':'blue'}/></div></td></tr>)}</tbody></table></div>
  </>;
}

export function CourseStudioScreen() {
  const {data, refresh}=useData();
  const [topic,setTopic]=useState('');
  const [objectives,setObjectives]=useState('');
  const [audience,setAudience]=useState('Non-CS beginners');
  const [stageId,setStageId]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [created,setCreated]=useState<{slug:string;generation_mode:string;message:string}|null>(null);
  if(!data)return null;
  const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');setCreated(null);
    try{const r=await api<{slug:string;generation_mode:string;message:string}>('instructor/courses/',{method:'POST',body:JSON.stringify({topic,objectives,audience,stage_id:Number(stageId||data.stages[0]?.id)})});setCreated(r);await refresh();}
    catch(err){setError(err instanceof Error?err.message:'Could not draft the course');}
    finally{setBusy(false);}
  };
  return <><Link href="/instructor" className="back-link"><Icon name="back" size={17}/> Instructor overview</Link><div className="page-header"><div><span className="eyebrow" style={{marginBottom:9}}>YOUR COURSE CREATION SPACE</span><h1 className="page-title">Course Studio <span style={{color:'#8457eb'}}>✦</span></h1><p className="page-description">Turn an idea into a mini-course. Review and improve every lesson before using it in teaching.</p></div></div>
    <div className="studio-container"><div className="card studio-form"><h2>Create a new mini-course</h2><p>Enter your topic and learning objectives. The server uses a real AI model only when you configure an API key; otherwise it creates an editable offline template.</p><form onSubmit={e=>void submit(e)}><label className="form-label">COURSE TOPIC<input required minLength={3} maxLength={140} className="form-field" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Introduction to unit testing"/></label><label className="form-label">LEARNING OBJECTIVES<textarea value={objectives} onChange={e=>setObjectives(e.target.value)} placeholder="After this course, students should be able to..."/></label><div className="form-grid"><label className="form-label">TARGET AUDIENCE<select value={audience} onChange={e=>setAudience(e.target.value)}><option>Non-CS beginners</option><option>CS graduates</option><option>Mixed-background learners</option></select></label><label className="form-label">ADD TO ROADMAP STAGE<select value={stageId||String(data.stages[0]?.id||'')} onChange={e=>setStageId(e.target.value)}>{data.stages.map(s=><option key={s.id} value={String(s.id)}>{s.position}. {s.title}</option>)}</select></label></div><div className="form-actions"><button disabled={busy||!topic.trim()} className="btn btn-purple" type="submit"><Icon name="sparkles" size={17}/>{busy?'Generating course...':'Draft mini-course'}</button><span style={{fontSize:11,color:'#96a3b8'}}>3 focused lessons · review and edit in browser</span></div></form>{error&&<div className="error-message" style={{marginTop:17}}>{error}</div>}</div>
      {created&&<div className="card created-panel"><div className="success-message"><strong>Course created.</strong> {created.message}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:15,marginTop:18,flexWrap:'wrap'}}><div><h3 style={{margin:'0 0 5px'}}>{topic}</h3><p style={{margin:0}}>Generation: {created.generation_mode==='ai'?'Live AI':'Offline sample template'}</p></div><Link href={`/instructor/edit/${created.slug}`} className="btn btn-primary">Review & edit course <Icon name="arrow" size={16}/></Link></div></div>}
      <div className="demo-message" style={{marginTop:18}}><strong>Prototype limitation:</strong> You can create, edit and assign courses, but secure instructor sign-in, student enrollment controls and richer activity authoring are future work.</div>
    </div>
  </>;
}

export function AssignmentsScreen() {
  const {data, refresh}=useData();
  const [slug,setSlug]=useState('');
  const [audience,setAudience]=useState('Class A');
  const [dueDate,setDueDate]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  if(!data)return null;
  const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');setMessage('');
    try { const res=await api<{message:string}>('instructor/assignments/',{method:'POST',body:JSON.stringify({item_slug:slug||data.items[0]?.slug,audience,due_date:dueDate||null})});setMessage(res.message);await refresh();}
    catch(err){setError(err instanceof Error?err.message:'Could not assign activity');}
    finally{setBusy(false);}
  };
  return <><Link href="/instructor" className="back-link"><Icon name="back" size={17}/> Instructor overview</Link><div className="page-header"><div><span className="eyebrow" style={{marginBottom:9}}>MANAGE LEARNING</span><h1 className="page-title">Course & Mission Assignments</h1><p className="page-description">Assign an existing activity to a demo class and track it alongside learner progress.</p></div><Link className="btn btn-secondary" href="/instructor/create"><Icon name="plus" size={16}/> Create course</Link></div>
    <div className="studio-container"><div className="card studio-form"><h2>New assignment</h2><p>Choose any activity from the current learning path, including the instructor-created courses.</p><form onSubmit={e=>void submit(e)}><label className="form-label">COURSE OR MISSION<select required value={slug||data.items[0]?.slug||''} onChange={e=>setSlug(e.target.value)}>{data.items.map(i=><option key={i.slug} value={i.slug}>{i.kind==='course'?'Course':'Mission'} — {i.title}</option>)}</select></label><div className="form-grid"><label className="form-label">ASSIGN TO<select value={audience} onChange={e=>setAudience(e.target.value)}><option>Class A</option><option>Class B</option><option>All demo students</option></select></label><label className="form-label">DUE DATE (OPTIONAL)<input className="form-field" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label></div><button disabled={busy||data.items.length===0} type="submit" className="btn btn-primary"><Icon name="clipboard" size={16}/>{busy?'Saving...':'Assign activity'}</button></form>{error&&<div className="error-message" style={{marginTop:17}}>{error}</div>}{message&&<div className="success-message" style={{marginTop:17}}>{message}</div>}</div>
    <SectionHeading title="Existing assignments" subtitle="Saved in the Django SQLite database."/>
    <div className="card">{data.instructor.assignments.map(a=><div className="assignment-row" key={a.id} style={{padding:'16px 20px'}}><span className={`item-icon ${a.kind==='course'?'item-course':'item-mission'}`}><Icon name={a.kind==='course'?'book':'gamepad'} size={21}/></span><div><strong>{a.item}</strong><span>{a.audience} · {a.due_date?`Due ${a.due_date}`:'No due date'}</span></div><span className="pill pill-green">Assigned</span></div>)}{!data.instructor.assignments.length&&<div className="empty-state">No assignments yet.</div>}</div>
    <div className="demo-message" style={{marginTop:18}}>This prototype stores assignments and displays them to instructors. Individual student enrolment, deadlines enforcement and permissions require an authentication layer in a production system.</div></div>
  </>;
}

export function CourseEditorScreen() {
  const params = useParams();
  const slug = String(params.slug || '');
  const {refresh} = useData();
  const [loading,setLoading] = useState(true);
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [lessons,setLessons] = useState<{title:string;text:string}[]>([]);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  useEffect(()=>{setLoading(true);void api<ItemDetail>(`items/${slug}/`).then(d=>{
    if(d.item.kind!=='course')throw new Error('Only courses can be edited');
    setTitle(d.item.title);setSummary(d.item.summary);setLessons(d.body.lessons||[]);setLoading(false);
  }).catch(e=>{setError(e instanceof Error?e.message:'Could not load course');setLoading(false);});},[slug]);
  const patch = (index:number,field:'title'|'text',value:string) => setLessons(ls=>ls.map((l,i)=>i===index?{...l,[field]:value}:l));
  const submit = async(e:FormEvent) => { e.preventDefault();setBusy(true);setError('');setMessage('');
    try {const r=await api<{message:string}>(`instructor/courses/${slug}/`,{method:'PATCH',body:JSON.stringify({title,summary,lessons})});setMessage(r.message);await refresh();}
    catch(err){setError(err instanceof Error?err.message:'Save failed');}finally{setBusy(false);}
  };
  if(loading)return <div className="loading">Loading course editor...</div>;
  return <><Link href="/instructor/create" className="back-link"><Icon name="back" size={17}/> Course studio</Link><div className="page-header"><div><span className="eyebrow" style={{marginBottom:9}}>INSTRUCTOR EDITOR</span><h1 className="page-title">Edit mini-course</h1><p className="page-description">Review AI or template output and refine each lesson before assigning it.</p></div><Link className="btn btn-outline" href={`/courses/${slug}`}>Student preview <Icon name="arrow" size={16}/></Link></div><div className="studio-container"><div className="card studio-form"><form onSubmit={e=>void submit(e)}><label className="form-label">COURSE NAME<input className="form-field" required value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="form-label">COURSE SUMMARY<textarea required value={summary} onChange={e=>setSummary(e.target.value)}/></label><h2>Lessons</h2>{lessons.map((l,i)=><div key={i} style={{padding:17,background:'#f7f9fd',borderRadius:12,marginBottom:13}}><label className="form-label">LESSON {i+1} TITLE<input className="form-field" required value={l.title} onChange={e=>patch(i,'title',e.target.value)}/></label><label className="form-label">LESSON CONTENT<textarea required rows={5} value={l.text} onChange={e=>patch(i,'text',e.target.value)}/></label><button className="btn btn-outline" type="button" disabled={lessons.length===1} onClick={()=>setLessons(ls=>ls.filter((_,n)=>n!==i))}><Icon name="close" size={14}/> Remove lesson</button></div>)}<div className="form-actions"><button className="btn btn-secondary" type="button" disabled={lessons.length>=10} onClick={()=>setLessons(ls=>[...ls,{title:'New lesson',text:'Describe the concept, an example, and a practical activity.'}])}><Icon name="plus" size={15}/> Add lesson</button><button className="btn btn-primary" type="submit" disabled={busy}>{busy?'Saving...':'Save changes'}<Icon name="check" size={16}/></button></div></form>{error&&<div className="error-message" style={{marginTop:15}}>{error}</div>}{message&&<div className="success-message" style={{marginTop:15}}>{message}</div>}</div></div></>;
}
