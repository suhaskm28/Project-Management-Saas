'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileForm() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Store original values
    const [originalData, setOriginalData] = useState({
        fullName: '',
        email: '',
        bio: '',
        phone: '',
    });

    // Current form values
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        bio: '',
        phone: '',
    });

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            const userData = {
                fullName: user.fullName || '',
                email: user.email || '',
                bio: user.profile?.bio || '',
                phone: user.profile?.phone || '',
            };
            setOriginalData(userData);
            setFormData(userData);
        }
    }, [user]);

    // Check if form has unsaved changes
    const hasChanges = () => {
        return (
            formData.fullName !== originalData.fullName ||
            formData.email !== originalData.email ||
            formData.bio !== originalData.bio ||
            formData.phone !== originalData.phone
        );
    };

    // Get only the changed fields
    const getChangedFields = () => {
        const changes: Partial<typeof formData> = {};
        if (formData.fullName !== originalData.fullName) changes.fullName = formData.fullName;
        if (formData.email !== originalData.email) changes.email = formData.email;
        if (formData.bio !== originalData.bio) changes.bio = formData.bio;
        if (formData.phone !== originalData.phone) changes.phone = formData.phone;
        return changes;
    };

    const handleReset = () => {
        setFormData(originalData);
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Only send changed fields
            const changedFields = getChangedFields();
            await updateProfile(changedFields);
            await refreshUser();

            // Update original data to new values
            setOriginalData(formData);
            setSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const isDirty = hasChanges();

    return (
        <form onSubmit={handleSubmit}>
            <Card className="glass shadow-xl rounded-2xl border-border overflow-hidden">
                <CardHeader className="bg-secondary/5 border-b border-border/60 pb-6">
                    <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Profile Info</CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-tight opacity-70">
                        Update your account's profile information and details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us a little bit about yourself"
                        />
                    </div>
                    {isDirty && !error && !success && (
                        <p className="text-sm text-amber-600">You have unsaved changes</p>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-500">Profile updated successfully!</p>}
                </CardContent>
                <CardFooter className="flex gap-3 bg-secondary/5 border-t border-border/60 pt-6">
                    <Button type="submit" disabled={loading || !isDirty} className="rounded-xl px-6 font-black uppercase tracking-widest bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={!isDirty || loading}
                        className="rounded-xl px-6 font-black uppercase tracking-widest border-border hover:bg-accent transition-all"
                    >
                        Reset
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
