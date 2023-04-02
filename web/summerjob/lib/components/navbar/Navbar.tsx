"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import logoImage from "public/logo-smj-yellow.png";
import { UserSession } from "lib/types/auth";
import { signIn, signOut } from "next-auth/react";

type NavPath = {
  path: string;
  name: string;
  icon: string;
};

interface NavbarProps {
  session: UserSession | null;
}

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const navPaths: NavPath[] = [
    { path: "/plans", name: "Plán", icon: "fas fa-calendar-alt" },
    { path: "/jobs", name: "Joby", icon: "fas fa-person-digging" },
    { path: "/cars", name: "Auta", icon: "fas fa-car" },
    { path: "/workers", name: "Pracanti", icon: "far fa-user" },
    { path: "/admin", name: "Administrace", icon: "fas fa-cogs" },
    { path: "/my-plan", name: "Můj plán", icon: "fas fa-calendar-alt" },
    { path: "/profile", name: "Profil", icon: "fas fa-user" },
  ];
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  return (
    <>
      <nav className="navbar navbar-light navbar-expand-md smj-gray pt-2 pb-2 mb-0">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <Image
              src={logoImage}
              className="smj-nav-logo"
              alt="SummerJob logo"
              quality={98}
              priority={true}
            />
          </a>
          <button
            data-bs-toggle="collapse"
            className="navbar-toggler"
            data-bs-target="#navcol-1"
            onClick={toggleExpanded}
          >
            <span className="visually-hidden">Toggle navigation</span>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
            id="navcol-1"
          >
            <ul className="navbar-nav me-auto">
              {navPaths.map((navPath) => {
                return (
                  <li className="nav-item" key={navPath.path}>
                    <Link
                      className={
                        "nav-link d-xl-flex align-items-xl-center" +
                        (pathname?.startsWith(navPath.path) ? " active" : "")
                      }
                      href={navPath.path}
                    >
                      <div className="d-xl-flex justify-content-xl-start align-items-xl-center navbar-div text-truncate rounded-3">
                        <i
                          className={
                            navPath.icon + " d-xl-flex justify-content-xl-start"
                          }
                        ></i>
                        <span>{navPath.name}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {session && (
              <>
                <div>{session.name}</div>
                <button
                  className="btn"
                  id="btn-nav-logout"
                  type="button"
                  onClick={() => signOut()}
                >
                  Odhlásit
                </button>
              </>
            )}
            {!session && (
              <>
                <button
                  className="btn"
                  id="btn-nav-logout"
                  type="button"
                  onClick={() => signIn()}
                >
                  Přihlásit se
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
