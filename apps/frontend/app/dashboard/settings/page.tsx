import { SettingsLayout } from '@/components/settings/settings-layout';
import { ProfileForm } from '@/components/settings/profile-form';

export default function SettingsPage() {
    return (
        <SettingsLayout>
            <div className="space-y-6">
                <ProfileForm />
            </div>
        </SettingsLayout>
    );
}
