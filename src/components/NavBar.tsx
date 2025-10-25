// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Book, GearFill, PersonCircle, Eyeglasses, CloudUpload } from 'react-bootstrap-icons';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userTriggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipInstancesRef = useRef<any[]>([]);
  const userName = session?.user?.name || session?.user?.email || "U";
  const initials = useMemo(() => {
    const parts = (userName || "U").trim().split(/\s+/);
    const first = parts[0]?.[0] || "U";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || "") : "";
    return (first + last).substring(0, 2).toUpperCase();
  }, [userName]);

  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Rely on Bootstrap's native dropdown for user menu (no custom state)

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
    tooltipInstancesRef.current.forEach((t) => t.dispose?.());
    tooltipInstancesRef.current = [];
    if (!isCollapsed) return;
    // Use global bootstrap from the bundle loaded by ClientBootstrap
    const Tooltip = (typeof window !== 'undefined' && (window as any).bootstrap?.Tooltip) || undefined;
    if (!Tooltip) return;
    const selector = document.querySelectorAll('[data-bs-toggle="tooltip"][data-sidebar]');
    selector.forEach((el) => {
      const instance = new Tooltip(el as any, { placement: 'right', trigger: 'hover focus' });
      tooltipInstancesRef.current.push(instance);
    });
    return () => {
      tooltipInstancesRef.current.forEach((t) => t.dispose?.());
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
        <div className="d-flex align-items-center gap-2 mb-3 mb-md-0 me-md-auto">
          <button
            type="button"
            className="d-flex align-items-center gap-2 bg-transparent border-0 p-0 px-3 text-reset brand-toggle"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setIsCollapsed((s) => !s)}
          >
            <Eyeglasses className="text-primary" size={24} />
            <span className={`fw-semibold ${isCollapsed ? 'd-none' : ''}`}>Bookpal</span>
          </button>
        </div>
        <hr className="my-3 menu-divider-top" />
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
        <div className="mt-auto">
          <hr className="my-3 menu-divider" />
          <div className="dropdown position-relative">
          <button
            ref={userTriggerRef}
            className={`${isCollapsed ? '' : 'w-100'} d-flex align-items-center dropdown-toggle bg-transparent border-0 p-0 ${isCollapsed ? 'justify-content-center' : ''}`}
            data-bs-toggle={'dropdown'}
            title={session.user?.name ?? ''}
            type="button"
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className={`rounded-circle ${isCollapsed ? '' : 'me-2'}`}
              />
            ) : (
              <span className={`avatar-circle ${isCollapsed ? '' : 'me-2'}`} aria-hidden="true">{initials}</span>
            )}
            <strong className={isCollapsed ? 'd-none' : ''}>{session.user?.name}</strong>
          </button>
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
        </div>
        {/* Collapsed state uses native Bootstrap dropdown as well */}
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