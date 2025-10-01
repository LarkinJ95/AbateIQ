import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
                <h1 className="font-headline text-lg font-semibold md:text-xl">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <UserNav />
            </div>
        </header>
    );
}
