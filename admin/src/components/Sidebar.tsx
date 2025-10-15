import { Link, useLocation } from 'react-router-dom'
import { HiViewGrid, HiLogout, HiUsers } from 'react-icons/hi'
import { useAuth } from '../hooks/useAuth'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link to="/">
          <div className="text-white text-2xl font-bold">Game Center</div>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">MENU</h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <Link
                  to="/dashboard"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    location.pathname === '/dashboard' && 'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <HiViewGrid className="text-xl" />
                  Dashboard
                </Link>
              </li>

              {useAuth().user?.role === 'admin' && (
                <li>
                  <Link
                    to="/admins"
                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      location.pathname === '/admins' && 'bg-graydark dark:bg-meta-4'
                    }`}
                  >
                    <HiUsers className="text-xl" />
                    Admin Management
                  </Link>
                </li>
              )}

              <li>
                <button
                  onClick={handleLogout}
                  className="group relative flex w-full items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
                >
                  <HiLogout className="text-xl" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
