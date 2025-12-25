import { NavLink } from 'react-router-dom';
import {
  HiAnnotation,
  HiBriefcase,
  HiChartSquareBar,
  HiCalendar,
  HiClipboardList,
  HiDocumentText,
  HiLightningBolt,
  HiMail,
  HiOutlineCog,
  HiOutlinePhotograph,
  HiShieldCheck,
  HiSpeakerphone,
  HiTemplate,
  HiUserCircle,
  HiUserGroup,
  HiViewGrid,
} from 'react-icons/hi';
import { navSections } from '../config/navigation';

const iconMap = {
  HiAnnotation,
  HiBriefcase,
  HiChartSquareBar,
  HiCalendar,
  HiClipboardList,
  HiDocumentText,
  HiLightningBolt,
  HiMail,
  HiOutlineCog,
  HiOutlinePhotograph,
  HiShieldCheck,
  HiSpeakerphone,
  HiTemplate,
  HiUserCircle,
  HiUserGroup,
  HiViewGrid,
};

export default function AdminSidebar({ collapsed, onToggle, role = 'USER' }) {
  const isAllowed = (roles = []) => roles.length === 0 || roles.includes(role);

  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-200 border-r border-slate-200 bg-white/80 px-3 py-4 dark:border-slate-800 dark:bg-slate-900/80`}
    >
      <div className='mb-6 flex items-center justify-between gap-2'>
        <div>
          <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>Trust Media</p>
          <p className='text-sm font-semibold text-slate-900 dark:text-white'>Agency CMS</p>
        </div>
        <button
          type='button'
          onClick={onToggle}
          className='rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
        >
          <span className='sr-only'>Basculer la sidebar</span>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className='space-y-6'>
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>{section.label}</p>
            )}
            <div className='space-y-1'>
              {section.items
                .filter((item) => isAllowed(item.roles))
                .map((item) => {
                  const Icon = iconMap[item.icon] || HiViewGrid;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/dashboard'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        } ${collapsed ? 'justify-center px-2' : ''}`
                      }
                    >
                      <Icon className='h-5 w-5 shrink-0' />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
