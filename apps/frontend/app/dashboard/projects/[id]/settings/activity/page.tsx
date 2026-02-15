'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectSettingsLayout } from '@/components/settings/project-settings-layout';
import { ActivityLog } from '@/components/settings/activity-log';

import { api } from '@/lib/api';

export default function ProjectActivityPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchActivities();
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

    const fetchActivities = async () => {
        try {
            const data = await api<any>(`/projects/${projectId}/activity`);
            setActivities(data);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProjectSettingsLayout projectName={projectName}>
            <ActivityLog activities={activities} loading={loading} />
        </ProjectSettingsLayout>
    );
}
