import { SettingsLayout } from '@/components/settings/settings-layout';
import { PasswordForm } from '@/components/settings/password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecurityPage() {
    return (
        <SettingsLayout>
            <div className="space-y-6">
                <PasswordForm />

                <Card>
                    <CardHeader>
                        <CardTitle>Active Sessions</CardTitle>
                        <CardDescription>
                            Manage your active sessions across devices (Coming soon)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Session management will be available in a future update.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout>
    );
}
