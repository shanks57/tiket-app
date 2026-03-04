import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { BookOpen, Folder, LayoutGrid, Settings, Tickets, Users2, Wrench, User } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.role;

    // Base navigation items for all users
    const baseNavItems: NavItem[] = [
        {
            title: 'Dasbor',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Role-specific navigation items
    const getRoleSpecificNavItems = (): NavItem[] => {
        switch (userRole) {
            case 'admin':
                return [
                    {
                        title: 'Semua Tiket',
                        href: '/admin/tickets',
                        icon: Tickets,
                    },
                    {
                        title: 'Pengguna',
                        href: '/admin/users',
                        icon: Users2,
                    },
                    {
                        title: 'Kategori',
                        href: '/admin/categories',
                        icon: Folder,
                    },
                ];
            case 'technician':
                return [
                    {
                        title: 'Semua Tiket',
                        href: '/admin/tickets',
                        icon: Tickets,
                    },
                    {
                        title: 'Belum Ditugaskan',
                        href: '/admin/tickets?assigned_to=unassigned',
                        icon: Folder,
                    },
                    {
                        title: 'Tiket Saya',
                        href: '/admin/tickets?assigned_to=me',
                        icon: Wrench,
                    },
                ];
            case 'user':
            default:
                return [
                    {
                        title: 'Daftar Tiket',
                        href: '/user/tickets',
                        icon: User,
                    },
                    {
                        title: 'Buat Tiket',
                        href: '/tickets/create',
                        icon: Tickets,
                    },
                ];
        }
    };

    // Settings is available for all users
    const settingsNavItem: NavItem = {
        title: 'Pengaturan',
        href: '/settings/profile',
        icon: Settings,
    };

    const mainNavItems: NavItem[] = [
        ...baseNavItems,
        ...getRoleSpecificNavItems(),
        settingsNavItem,
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar className="hidden md:flex md:flex-col" collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
                <div className="px-4 py-2 border-t border-sidebar-border/50">
                    <p className="text-[10px] text-muted-foreground font-mono opacity-50 text-center uppercase tracking-widest">
                        v{import.meta.env.VITE_APP_VERSION || '1.0.0-local'}
                    </p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
