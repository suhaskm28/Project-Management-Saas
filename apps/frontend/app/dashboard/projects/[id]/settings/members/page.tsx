'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectSettingsLayout } from '@/components/settings/project-settings-layout';
import { RoleBadge } from '@/components/settings/role-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type MemberRole = 'owner' | 'admin' | 'member';

interface Member {
    userId: string;
    role: MemberRole;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

import { api } from '@/lib/api';

export default function ProjectMembersPage() {
    const params = useParams();
    const projectId = params?.id as string;

    const [members, setMembers] = useState<Member[]>([]);
    const [projectName, setProjectName] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState<MemberRole>('member');
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<MemberRole>('member');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchMembers();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const data = await api<any>(`/projects/${projectId}`);
            setProjectName(data.name);
        } catch (error) {
            console.error('Failed to fetch project:', error);
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await api<Member[]>(`/projects/${projectId}/members`);
            setMembers(data);

            // Get current user to determine permissions
            try {
                const currentUser = await api<any>('/users/me');
                const currentMember = data.find((m: Member) => m.userId === currentUser.id);
                if (currentMember) {
                    setCurrentUserRole(currentMember.role);
                }
            } catch (authError) {
                console.error('Auth check failed:', authError);
            }
        } catch (error: any) {
            console.error('Failed to fetch members:', error);
            setError(error.message || 'Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setError(null);

        try {
            await api(`/projects/${projectId}/members`, {
                method: 'POST',
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            setInviteEmail('');
            setInviteRole('member');
            fetchMembers();
        } catch (error: any) {
            console.error('Failed to invite member:', error);
            setError(error.message || 'Failed to invite member');
        } finally {
            setInviting(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: MemberRole) => {
        setError(null);
        try {
            await api(`/projects/${projectId}/members/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole }),
            });
            fetchMembers();
        } catch (error: any) {
            console.error('Failed to update role:', error);
            setError(error.message || 'Failed to update member role');
        }
    };

    const handleRemove = async (userId: string) => {
        setError(null);
        try {
            await api(`/projects/${projectId}/members/${userId}`, {
                method: 'DELETE',
            });
            fetchMembers();
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            setError(error.message || 'Failed to remove member');
        }
    };

    const isOwner = currentUserRole === 'owner';
    const canManage = isOwner || currentUserRole === 'admin';

    if (loading) {
        return (
            <ProjectSettingsLayout projectName={projectName}>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Loading members...</p>
                    </CardContent>
                </Card>
            </ProjectSettingsLayout>
        );
    }

    return (
        <ProjectSettingsLayout projectName={projectName}>
            <div className="space-y-6">
                {canManage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite Member</CardTitle>
                            <CardDescription>
                                Add new members to your project by email
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="member@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={inviteRole}
                                        onValueChange={(value: string) => setInviteRole(value as MemberRole)}
                                    >
                                        <SelectTrigger id="role">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={inviting}>
                                    {inviting ? 'Inviting...' : 'Invite Member'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Team Members ({members.length})</CardTitle>
                        <CardDescription>
                            Manage people with access to this project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {members.map((member) => (
                                <div
                                    key={member.userId}
                                    className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{member.user.fullName}</p>
                                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOwner && member.role !== 'owner' ? (
                                            <Select
                                                value={member.role}
                                                onValueChange={(value: string) => handleRoleChange(member.userId, value as MemberRole)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="owner">Owner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <RoleBadge role={member.role} />
                                        )}

                                        {isOwner && member.role !== 'owner' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove {member.user.fullName} from this project?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleRemove(member.userId)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>
                            Understanding what each role can do
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <RoleBadge role="owner" />
                                <p className="text-muted-foreground">Full control including project deletion, member management, and all permissions</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <RoleBadge role="admin" />
                                <p className="text-muted-foreground">Can invite members, update project settings, and manage tasks</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <RoleBadge role="member" />
                                <p className="text-muted-foreground">Can view project and contribute to tasks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProjectSettingsLayout>
    );
}
