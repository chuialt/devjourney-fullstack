'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import { useData } from './provider';

const studentNav = [
  ['/', 'Overview', 'home'], ['/roadmap', 'My Roadmap', 'map'], ['/paths', 'Career Paths', 'flag'],
  ['/courses', 'Courses', 'book'], ['/missions', 'Missions', 'gamepad'], ['/progress', 'My Progress', 'chart'],
];
const instructorNav = [
  ['/instructor', 'Overview', 'home'], ['/instructor/create', 'Course Studio', 'sparkles'],
  ['/instructor/assignments', 'Assignments', 'clipboard'], ['/instructor#students', 'Students', 'users'],
];
export function Shell({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const {data, loading, error, refresh} = useData();
  const instructor = pathname.startsWith('/instructor');
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const nav = instructor ? instructorNav : studentNav;
  return <div className="app-frame">
    {open && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link href="/" className="brand"><span className="brand-symbol"><span/></span><span>DevJourney<span className="brand-dot">.</span></span></Link>
      <div className="sidebar-caption">{instructor ? 'INSTRUCTOR SPACE' : 'YOUR WORKSPACE'}</div>
      <nav className="side-nav">{nav.map(([url, title, icon]) => {
        const active = url.includes('#') ? false : (url === '/' || url === '/instructor' ? pathname === url : pathname.startsWith(url));
        return <Link key={url} href={url} className={`nav-link ${active ? 'nav-active' : ''}`}><Icon name={icon} size={19}/><span>{title}</span>{active && <span className="nav-dot"/>}</Link>;
      })}</nav>
      <div className="sidebar-bottom">
        <div className="guide-card"><div className="guide-robot"><span className="robot-antenna"/><span className="robot-face">•ᴗ•</span></div><span className="eyebrow">YOUR LEARNING COMPANION</span><h3>Make progress,<br/>one quest at a time.</h3><p>Ask questions, explore new skills, and build confidence.</p><Link href={instructor ? '/instructor/create' : '/missions'} className="guide-link">{instructor ? 'Open course studio' : 'Explore missions'} <Icon name="arrow" size={15}/></Link></div>
        <div className="sidebar-mode"><span>WORKSPACE</span><Link href={instructor ? '/' : '/instructor'}><Icon name={instructor ? 'code' : 'users'} size={16}/>{instructor ? 'Student view' : 'Instructor view'}<Icon name="arrow" size={15}/></Link></div>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setOpen(true)}><Icon name="menu"/></button>
        <div className="breadcrumbs"><span className="crumb-dot"/><span>{instructor ? 'Instructor dashboard' : 'Learning hub'}</span><span className="crumb-divider">/</span><strong>{({ '/': 'Overview', '/roadmap': 'My Roadmap', '/paths': 'Career Paths', '/courses': 'Courses', '/missions': 'Missions', '/progress': 'Progress', '/instructor': 'Overview', '/instructor/create': 'Course Studio', '/instructor/assignments': 'Assignments' } as Record<string, string>)[pathname] || 'Activity'}</strong></div>
        <div className="top-actions"><div className="top-streak"><Icon name="fire" size={18}/><strong>{data?.learner.streak ?? 0}</strong><span>day streak</span></div><span className="top-separator"/><div className="top-xp"><Icon name="trophy" size={17}/><strong>{data?.learner.xp ?? 0}</strong><span>XP</span></div><span className="top-separator"/><div className="avatar">{instructor ? 'SK' : (data?.learner.initials ?? 'AC')}</div><div className="profile-text"><strong>{instructor ? 'Sarah Kim' : (data?.learner.name || 'Student')}</strong><small>{instructor ? 'Instructor' : 'Explorer'}</small></div></div>
      </header>
      <div className="page-content">
        {loading && !data ? <div className="loading"><span className="spinner"/>Connecting to your learning world...</div> : error && !data ? <div className="error-panel"><Icon name="alert" size={32}/><h2>Cannot reach the Django API</h2><p>{error}</p><p>Start the backend at <code>127.0.0.1:8000</code> and run <code>python manage.py seed_demo</code>.</p><button className="btn btn-primary" onClick={() => void refresh()}>Try again</button></div> : children}
      </div>
    </div>
  </div>;
}
