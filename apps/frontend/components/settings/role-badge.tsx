import { Badge } from '@/components/ui/badge';

type MemberRole = 'owner' | 'admin' | 'member';

interface RoleBadgeProps {
    role: MemberRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const variants: Record<MemberRole, { variant: any; className: string }> = {
        owner: { variant: 'default', className: 'bg-purple-500 hover:bg-purple-600' },
        admin: { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
        member: { variant: 'secondary', className: '' },
    };

    const config = variants[role];

    return (
        <Badge variant={config.variant} className={config.className}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
    );
}
