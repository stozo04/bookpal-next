// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Book, GearFill, PersonCircle, ChevronLeft, ChevronRight, Eyeglasses, CloudUpload } from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import { useRef } from 'react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userTriggerRef = useRef<HTMLAnchorElement | null>(null);

  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Close user menu when clicking outside or on escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!userTriggerRef.current) return;
      const trigger = userTriggerRef.current;
      const menuOpen = userMenuOpen;
      if (!menuOpen) return;
      // if click is inside trigger (or its children), ignore
      if (trigger.contains(target)) return;
      // otherwise close
      setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  const isActive = (href: string) => pathname === href;

  // Don't render the NavBar unless the user is signed in.
  // While session is loading, also hide the NavBar to avoid UI flashes.
  if (status === 'loading' || !session?.user) return null;

  return (
    <>
      <div
        className={`d-flex flex-column flex-shrink-0 p-3 bg-light sidebar ${isCollapsed ? 'collapsed' : ''}`}

      >
        <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto">
          <Link href="/" className="d-flex align-items-center link-dark text-decoration-none">
            <Eyeglasses className="me-2" size={24} />
            <span className={`fs-4 ${isCollapsed ? 'd-none' : ''}`}>Bookpal</span>
          </Link>
          <button
            className="btn btn-link ms-auto p-0 d-none d-md-block text-dark"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <Link
              href="/library"
              className={`nav-link ${isActive('/library') ? 'active' : 'link-dark'}`}
              title="Library"
            >
              <Book className={isCollapsed ? 'mx-auto' : 'me-2'} />
              <span className={isCollapsed ? 'd-none' : ''}>Library</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              href="/uploads"
              className={`nav-link ${isActive('/uploads') ? 'active' : 'link-dark'}`}
              title="Uploads"
            >
              <CloudUpload className={isCollapsed ? 'mx-auto' : 'me-2'} />
              <span className={isCollapsed ? 'd-none' : ''}>Uploads</span>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="dropdown position-relative">
          <a
            href="#"
            ref={userTriggerRef}
            onClick={(e) => {
              if (isCollapsed) {
                e.preventDefault();
                setUserMenuOpen((s) => !s);
              }
            }}
            className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle"
            data-bs-toggle={isCollapsed ? undefined : 'dropdown'}
            aria-expanded={isCollapsed ? !!userMenuOpen : undefined}
            title={session.user?.name ?? ''}
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="rounded-circle me-2"
              />
            ) : (
              <PersonCircle className="rounded-circle me-2" size={32} />
            )}
            <strong className={isCollapsed ? 'd-none' : ''}>{session.user?.name}</strong>
          </a>
          {/* Standard bootstrap dropdown for expanded sidebar */}
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
            <li>
              <Link href="/profile" className="dropdown-item">
                <PersonCircle className="me-2" />
                Profile
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
        {/* When collapsed and user signed in, render a floating menu so items are readable */}
        {session?.user && isCollapsed && userMenuOpen && (
          <div
            className="dropdown-menu show shadow"
            role="menu"
            aria-label="User menu"
          >
            <Link href="/settings" className="dropdown-item">
              <GearFill className="me-2" /> Settings
            </Link>
            <Link href="/profile" className="dropdown-item">
              <PersonCircle className="me-2" /> Profile
            </Link>
            <hr className="dropdown-divider" />
            <button className="dropdown-item text-danger" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign out
            </button>
          </div>
        )}
      </div>
      {isMobile && !isCollapsed && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 1029 }}
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}