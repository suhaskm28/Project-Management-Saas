'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectSettingsLayout } from '@/components/settings/project-settings-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { api } from '@/lib/api';

export default function ProjectDangerPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [archiving, setArchiving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const data = await api<any>(`/projects/${projectId}`);
            setProject(data);
        } catch (error: any) {
            console.error('Failed to fetch project:', error);
            setError(error.message || 'Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        setArchiving(true);
        setError(null);
        try {
            await api(`/projects/${projectId}/archive`, {
                method: 'PATCH',
            });
            router.push('/dashboard/projects');
        } catch (error: any) {
            console.error('Failed to archive project:', error);
            setError(error.message || 'Failed to archive project');
        } finally {
            setArchiving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            await api(`/projects/${projectId}`, {
                method: 'DELETE',
            });
            router.push('/dashboard/projects');
        } catch (error: any) {
            console.error('Failed to delete project:', error);
            setError(error.message || 'Failed to delete project');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <ProjectSettingsLayout>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </CardContent>
                </Card>
            </ProjectSettingsLayout>
        );
    }

    return (
        <ProjectSettingsLayout projectName={project?.name}>
            <div className="space-y-6">
                <Card className="border-red-200 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="text-red-600">Archive Project</CardTitle>
                        <CardDescription>
                            Archive this project to hide it from active projects. You can restore it later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={archiving || project?.status === 'archived'}>
                                    {archiving ? 'Archiving...' : 'Archive Project'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will archive the project. You can restore it later from the archived projects section.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleArchive} className="bg-red-600 hover:bg-red-700">
                                        Archive
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {project?.status === 'archived' && (
                            <p className="text-sm text-muted-foreground mt-2">This project is already archived.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="text-red-600">Delete Project</CardTitle>
                        <CardDescription>
                            Permanently delete this project and all its data. This action cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Delete Project'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the project
                                        <strong> {project?.name}</strong> and all its tasks, members, and activity history.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                        Delete Permanently
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </ProjectSettingsLayout>
    );
}
