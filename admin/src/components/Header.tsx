import { HiMenu } from 'react-icons/hi'
import { useAuth } from '../hooks/useAuth'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation()
              setSidebarOpen(!sidebarOpen)
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <HiMenu className="text-2xl" />
          </button>
        </div>

        <div className="hidden sm:block">
          <h1 className="text-title-md2 font-semibold text-black dark:text-white">
            Game Management
          </h1>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <div className="flex items-center gap-4">
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-black dark:text-white">
                {user?.username}
              </span>
              <span className="block text-xs">{user?.role}</span>
            </span>

            <span className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
