import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex flex-1 flex-col ml-[260px] transition-all duration-300" id="admin-main">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
