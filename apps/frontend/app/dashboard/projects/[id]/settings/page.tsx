'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectSettingsLayout } from '@/components/settings/project-settings-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';

export default function ProjectGeneralSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [originalData, setOriginalData] = useState({
        name: '',
        description: '',
        status: 'active',
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
    });

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api<any>(`/projects/${projectId}`);
            const projectData = {
                name: data.name,
                description: data.description || '',
                status: data.status || 'active',
            };
            setOriginalData(projectData);
            setFormData(projectData);
        } catch (err: any) {
            console.error('Failed to fetch project:', err);
            setError(err.message || 'Failed to load project settings');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return (
            formData.name !== originalData.name ||
            formData.description !== originalData.description ||
            formData.status !== originalData.status
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges()) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const changes: any = {};
            if (formData.name !== originalData.name) changes.name = formData.name;
            if (formData.description !== originalData.description) changes.description = formData.description;
            if (formData.status !== originalData.status) changes.status = formData.status;

            const data = await api<any>(`/projects/${projectId}`, {
                method: 'PATCH',
                body: JSON.stringify(changes),
            });

            const updatedData = {
                name: data.name,
                description: data.description || '',
                status: data.status,
            };
            setOriginalData(updatedData);
            setFormData(updatedData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update project');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setFormData(originalData);
        setError(null);
        setSuccess(false);
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

    const isDirty = hasChanges();

    return (
        <ProjectSettingsLayout projectName={originalData.name}>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                            Update project name, description, and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Project description"
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isDirty && !error && !success && (
                            <p className="text-sm text-amber-600">You have unsaved changes</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {success && <p className="text-sm text-green-500">Project updated successfully!</p>}
                    </CardContent>
                    <div className="px-6 pb-6 flex gap-2">
                        <Button type="submit" disabled={saving || !isDirty}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={!isDirty || saving}
                        >
                            Reset
                        </Button>
                    </div>
                </Card>
            </form>
        </ProjectSettingsLayout>
    );
}
