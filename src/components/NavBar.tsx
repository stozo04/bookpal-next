// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Book, GearFill, PersonCircle, ChevronLeft, ChevronRight, Eyeglasses, CloudUpload } from 'react-bootstrap-icons';
import { useState, useEffect, useMemo, useRef } from 'react';
// Bootstrap tooltip support (loaded client-side only)
// Importing from 'bootstrap' is safe because ClientBootstrap loads the bundle in the browser
// Types are optional; runtime import is handled by Next on client
import { Tooltip } from "bootstrap";

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const tooltipInstancesRef = useRef<Tooltip[]>([]);

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

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const navItems = useMemo(
    () => [
      { href: "/library", label: "Library", Icon: Book },
      { href: "/uploads", label: "Uploads", Icon: CloudUpload },
    ],
    []
  );

  // Initialize tooltips for collapsed navigation items
  useEffect(() => {
    // dispose any existing tooltips
    tooltipInstancesRef.current.forEach((t) => t.dispose());
    tooltipInstancesRef.current = [];
    if (!isCollapsed) return;
    const selector = document.querySelectorAll('[data-bs-toggle="tooltip"][data-sidebar]');
    selector.forEach((el) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = new Tooltip(el as any, { placement: 'right', trigger: 'hover focus' });
      tooltipInstancesRef.current.push(instance);
    });
    return () => {
      tooltipInstancesRef.current.forEach((t) => t.dispose());
      tooltipInstancesRef.current = [];
    };
  }, [isCollapsed]);

  // Don't render the NavBar unless the user is signed in.
  // While session is loading, also hide the NavBar to avoid UI flashes.
  if (status === 'loading' || !session?.user) return null;

  return (
    <>
      <nav
        className={`d-flex flex-column flex-shrink-0 p-3 bg-white sidebar border-end shadow-sm ${isCollapsed ? 'collapsed' : ''}`}
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto">
          <Link href="/" className="d-flex align-items-center link-dark text-decoration-none">
            <Eyeglasses className="me-2 text-primary" size={24} />
            <span className={`fw-semibold ${isCollapsed ? 'd-none' : ''}`}>Bookpal</span>
          </Link>
          <button
            className="btn btn-outline-secondary btn-sm ms-auto d-inline-flex align-items-center"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <hr className="my-3" />
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(href);
            const linkClass = `nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${active ? 'active' : 'link-body-emphasis'}`;
            const iconClass = isCollapsed ? 'mx-auto' : '';
            const collapsedAttrs = isCollapsed
              ? { 'data-bs-toggle': 'tooltip', 'data-bs-placement': 'right', title: label, 'data-sidebar': '1' }
              : {};
            return (
              <li className="nav-item" key={href}>
                <Link
                  href={href}
                  className={linkClass}
                  aria-current={active ? 'page' : undefined}
                  {...collapsedAttrs}
                >
                  <Icon className={iconClass} />
                  <span className={isCollapsed ? 'd-none' : ''}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <hr className="my-3" />
        <div className="dropdown position-relative mt-auto">
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
          <ul className="dropdown-menu dropdown-menu-end text-small shadow">
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
      </nav>
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