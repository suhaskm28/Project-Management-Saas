'use client';

import { useState, useEffect } from 'react';
import { SettingsLayout } from '@/components/settings/settings-layout';
import { ActivityLog } from '@/components/settings/activity-log';

export default function ActivityPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/users/me/activity', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsLayout>
            <ActivityLog activities={activities} loading={loading} />
        </SettingsLayout>
    );
}
