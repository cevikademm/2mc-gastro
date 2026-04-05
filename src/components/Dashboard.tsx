import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { Plus, Filter, ChevronRight, History, Refrigerator, FolderOpen } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { projects, activities } = useProjectStore();
  const { user } = useAuthStore();

  const statusColors: Record<string, string> = {
    drafting: 'bg-blue-100 text-primary border-primary/10',
    quoted: 'bg-amber-100 text-amber-900 border-amber-200',
    complete: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    inProgress: 'bg-violet-100 text-violet-900 border-violet-200',
  };

  const statusLabels: Record<string, string> = {
    drafting: t('dashboard.drafting'),
    quoted: t('dashboard.quoted'),
    complete: t('dashboard.complete'),
    inProgress: t('dashboard.inProgress'),
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 relative">
      <div className="absolute inset-0 dot-grid pointer-events-none -z-10"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-black text-on-surface tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-on-surface-variant font-medium mt-1">
            {t('dashboard.welcome', { name: user?.fullName || 'Kullanıcı', count: projects.length })}
          </p>
        </div>
        <Link to="/projects/new" className="flex items-center gap-2 brushed-metal text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-95">
          <Plus size={20} /> {t('dashboard.newProject')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10">
          <div className="p-6 bg-surface-container border-b border-transparent flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-primary">{t('dashboard.activeProjects')}</h2>
            <Link to="/projects" className="text-on-surface-variant hover:text-primary transition-colors">
              <Filter size={20} />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container">
                  <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-on-surface-variant">{t('dashboard.projectName')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-on-surface-variant">{t('dashboard.lead')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-on-surface-variant">{t('common.status')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-on-surface-variant">{t('dashboard.timeline')}</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {projects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="group hover:bg-surface-container-high transition-colors cursor-pointer">
                    <td className="px-6 py-5">
                      <Link to={`/projects/${project.id}`}>
                        <div className="font-bold text-on-surface">{project.name}</div>
                        <div className="text-xs text-on-surface-variant mt-1">{project.type} | {project.area} m²</div>
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">{project.lead}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link to={`/projects/${project.id}`}>
                        <ChevronRight size={20} className="text-outline-variant group-hover:text-primary transition-colors inline-block" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <h2 className="font-headline text-lg font-bold text-primary flex items-center gap-2">
              <History size={20} /> {t('dashboard.recentActivity')}
            </h2>
            <div className="space-y-6">
              {activities.map((activity, i) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${activity.active ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                    {i < activities.length - 1 && <div className="w-0.5 h-full bg-outline-variant/30 mt-2"></div>}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-bold text-on-surface">{t(`dashboard.${activity.title}`, { defaultValue: activity.title })}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{activity.desc}</p>
                    <p className="text-[10px] text-primary/60 font-bold mt-1.5 tracking-wider uppercase">
                      {activity.time === 'yesterday' ? t('dashboard.yesterday') : activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/catalog" className="bg-primary-container p-5 rounded-xl flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-transform shadow-sm">
              <Refrigerator className="text-white mb-4" size={28} />
              <span className="text-white font-headline font-bold text-sm leading-tight">{t('dashboard.equipmentCatalog')}</span>
            </Link>
            <Link to="/docs" className="bg-surface-container-highest p-5 rounded-xl flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-transform shadow-sm">
              <FolderOpen className="text-primary mb-4" size={28} />
              <span className="text-primary font-headline font-bold text-sm leading-tight">{t('dashboard.standardsGuides')}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-on-surface">{t('dashboard.featuredItems')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tag: 'Vulcan Series', title: 'Endurance\u2122 Gas Ranges', color: 'from-primary to-primary-container' },
            { tag: 'PowerSteam', title: 'Combi-Oven Elite', color: 'from-secondary to-tertiary' },
            { tag: 'ColdChain', title: 'Walk-in Modular Units', color: 'from-tertiary to-primary' },
          ].map((item, i) => (
            <Link key={i} to="/catalog" className="relative group rounded-xl overflow-hidden bg-surface-container-lowest h-64 cursor-pointer shadow-sm">
              <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <Refrigerator size={64} className="text-white/20" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <span className="text-[10px] font-black text-primary-fixed uppercase tracking-widest bg-primary px-2.5 py-1 w-fit mb-2 rounded-sm">{item.tag}</span>
                <h3 className="text-white font-headline text-xl font-bold">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
