"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { useAuth } from "@/app/context/AuthContext";

// --- THÊM IMPORT ICON ---
import { UploadCloud } from "lucide-react";


const UserCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const ArrowLeftOnRectangleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);

const AcademicCapIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
);

const ClipboardDocumentListIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5v-1.5h-1.5a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.75 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0h3m-3 0h-3m-12.75 0H3m0a2.25 2.25 0 0 0-2.25 2.25v.75" />
    </svg>
);


const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0] || "Người dùng";
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const handleStickyNavbar = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => setOpenIndex(openIndex === index ? -1 : index);

  const usePathName = usePathname();


  return (
    <header className={`header left-0 top-0 z-40 flex w-full items-center ${sticky ? "dark:bg-gray-dark dark:shadow-sticky-dark fixed z-[9999] bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm transition" : "absolute bg-transparent"}`}>
      <div className="container">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4 xl:mr-12">
            <Link href="/" className={`header-logo block w-full ${sticky ? "py-5 lg:py-2" : "py-8"}`}>
              <Image src="/images/logo/logo-light.png" alt="logo" width={140} height={30} className="w-full dark:hidden" unoptimized/>
              <Image src="/images/logo/logo-light.png" alt="logo" width={140} height={30} className="hidden w-full dark:block" unoptimized/>
            </Link>
          </div>

          <div className="flex w-full items-center justify-between px-4">
            <div>
              <button onClick={navbarToggleHandler} id="navbarToggler" aria-label="Mobile Menu" className="absolute right-4 top-1/2 block translate-y-[-50%] rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden">
                <span className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "top-[7px] rotate-45" : ""}`} />
                <span className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "opacity-0" : ""}`} />
                <span className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "top-[-8px] -rotate-45" : ""}`} />
              </button>

              <nav id="navbarCollapse" className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${navbarOpen ? "visibility top-full opacity-100" : "invisible top-[120%] opacity-0"}`}>
                <ul className="block lg:flex lg:space-x-12 items-center">
                  {menuData.map((menuItem, index) => (
                    <li key={index} className="group relative flex items-center">
                      {menuItem.path ? (
                        <Link href={menuItem.path} className={`flex items-center py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-2.5 ${usePathName === menuItem.path ? "text-primary dark:text-white" : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"}`}>
                          {menuItem.title}
                        </Link>
                      ) : (
                        <>
                          <p onClick={() => handleSubmenu(index)} className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-2.5">
                            {menuItem.title}
                            <span className="pl-3">
                              <svg width="25" height="24" viewBox="0 0 25 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z" fill="currentColor" />
                              </svg>
                            </span>
                          </p>
                          <div className={`submenu relative left-0 top-full rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${openIndex === index ? "block" : "hidden"}`}>
                            {menuItem.submenu.map((submenuItem, subIndex) => (
                              <Link href={submenuItem.path} key={subIndex} className="block rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3">
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center justify-end pr-16 lg:pr-0">
              {isLoggedIn && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="group flex items-center gap-2.5 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <div className="flex flex-col items-end text-right">
                      <span className="hidden text-sm font-semibold text-gray-800 dark:text-white md:inline capitalize">Chào, {displayName}</span>
                      {user.name && <span className="hidden text-xs text-gray-500 dark:text-gray-400 md:inline truncate max-w-[150px]">{user.email}</span>}
                    </div>
                    <div className="relative">
                      <Image src={user.avatar || "/images/profile/user-icon-modern.svg"} alt="User Avatar" width={40} height={40} className="rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary transition-colors" unoptimized/>
                    </div>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-50">
                      <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">{displayName}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div className="py-1.5">
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                          <UserCircleIcon className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-sky-400" />
                          Hồ sơ
                        </Link>
                        
                        {user.role === 'UNIVERSITY' && (
                            <Link href="/my-university" onClick={() => setDropdownOpen(false)} className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                                <AcademicCapIcon className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-sky-400" />
                                Trường của tôi
                            </Link>
                        )}
                        
                        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                          <>
                            <Link href="/admin/admission-scores" onClick={() => setDropdownOpen(false)} className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-sky-400" />
                                Quản lý Điểm chuẩn
                            </Link>
                            
                            {/* --- THÊM MỤC MỚI Ở ĐÂY --- */}
                            <Link href="/admin/documents" onClick={() => setDropdownOpen(false)} className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                                <UploadCloud className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-sky-400" />
                                Upload Tài liệu
                            </Link>
                          </>
                        )}

                      </div>
                      <div className="py-1.5 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => { logout(); setDropdownOpen(false); }} className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
                          <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-500 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/signin" className="hidden rounded-md px-7 py-2.5 text-sm font-medium text-dark hover:opacity-80 dark:text-white md:block">Đăng nhập</Link>
                  <Link href="/signup" className="ease-in-up shadow-btn hover:shadow-btn-hover hidden rounded-md bg-primary px-7 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 md:block">Đăng ký</Link>
                </>
              )}
              <div className="ml-4">
                <ThemeToggler />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;