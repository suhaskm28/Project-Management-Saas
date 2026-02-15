// import { redirect } from "next/navigation";

// export default function DocsIndex() {
//     redirect("/docs/v1/getting-started");
// }

'use client';

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Search,
    ChevronRight,
    ArrowLeft,
    ExternalLink,
    Menu,
    X,
    Copy,
    CheckCircle2,
    ArrowUp
} from "lucide-react";

/* =========================================================
   CONFIG
   ========================================================= */

const docsStructure = [
    {
        category: "Getting Started",
        items: [
            { id: "introduction", label: "Introduction" },
            { id: "quickstart", label: "Quick Start" },
            { id: "requirements", label: "Requirements" },
            { id: "benefits", label: "Key Benefits" },
        ],
    },
    {
        category: "Core Features",
        items: [
            { id: "projects", label: "Projects Management" },
            { id: "tasks", label: "Tasks & Workflow" },
            { id: "collaboration", label: "Team Collaboration" },
            { id: "activity", label: "Activity Tracking" },
        ],
    },
    {
        category: "Administration",
        items: [
            { id: "roles", label: "Roles & Permissions" },
            { id: "authentication", label: "Authentication" },
            { id: "user-management", label: "User Management" },
        ],
    },
    {
        category: "Developer Guide",
        items: [
            { id: "api-overview", label: "API Overview" },
            { id: "api-examples", label: "API Examples" },
            { id: "best-practices", label: "Best Practices" },
        ],
    },
];

/* =========================================================
   PAGE
   ========================================================= */

export default function DocsPage() {
    const [search, setSearch] = useState("");
    const [activeSection, setActiveSection] = useState<string>("introduction");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const flatDocs = docsStructure.flatMap((g) => g.items);

    /* =========================
       Filtered Sidebar Search
       ========================= */

    const filteredDocs = useMemo(() => {
        if (!search) return docsStructure;

        return docsStructure.map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                item.label.toLowerCase().includes(search.toLowerCase())
            ),
        }));
    }, [search]);

    /* =========================
       Scroll Spy & Back-to-Top
       ========================= */

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );

        flatDocs.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [flatDocs]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentIndex = flatDocs.findIndex((d) => d.id === activeSection);
    const prevDoc = flatDocs[currentIndex - 1];
    const nextDoc = flatDocs[currentIndex + 1];
    const activeDoc = flatDocs.find((d) => d.id === activeSection);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">

            {/* =========================================================
               NAVIGATION HEADER
            ========================================================= */}

            <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
                <div className="px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>

                    <h1 className="text-lg font-bold tracking-tight">
                        Documentation
                    </h1>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        {sidebarOpen
                            ? <X className="h-5 w-5" />
                            : <Menu className="h-5 w-5" />}
                    </button>

                    <div className="hidden lg:block w-24" />
                </div>
            </div>

            <div className="flex flex-1 overflow-visible">

                {/* MOBILE SIDEBAR OVERLAY */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* =========================================================
                   LEFT SIDEBAR
                ========================================================= */}

                <aside
                    className={`
                        w-72 border-r bg-background transition-all duration-300 flex flex-col
                        ${sidebarOpen
                            ? "fixed inset-y-0 left-0 top-[57px] z-40 overflow-y-auto flex flex-col"
                            : "hidden lg:flex lg:flex-col lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto"
                        }
                    `}
                >
                    <div className="px-6 py-8 space-y-6">

                        <div>
                            <h2 className="text-lg font-bold mb-6">
                                Documentation
                            </h2>

                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search docs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {filteredDocs.map((group) => (
                            <div key={group.category} className="mb-6 lg:mb-8">
                                <div className="text-xs uppercase text-muted-foreground font-semibold mb-3 tracking-wider">
                                    {group.category}
                                </div>
                                <ul className="space-y-2">
                                    {group.items.map((item) => (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`block text-sm px-3 py-2 rounded-lg transition-all ${activeSection === item.id
                                                    ? "text-primary font-semibold bg-primary/10"
                                                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                                    }`}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* =========================================================
                   MAIN CONTENT
                ========================================================= */}

                <main className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16 space-y-16 lg:space-y-24">

                    {/* BREADCRUMBS */}

                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Docs
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            {activeDoc?.label}
                        </span>
                    </div>

                    {/* TABLE OF CONTENTS */}

                    <details className="group border rounded-lg p-4 lg:p-6 bg-muted/30 hover:bg-muted/50 transition-colors lg:open cursor-pointer">
                        <summary className="flex items-center justify-between font-semibold cursor-pointer select-none">
                            <span>On this page</span>
                            <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                        </summary>
                        <ul className="space-y-2 text-sm mt-4 pl-2">
                            {flatDocs.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        className={`block px-2 py-1 rounded transition-colors ${activeSection === item.id
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground hover:text-primary"
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </details>

                    {/* =========================================================
                       ALL DOC SECTIONS (UNCHANGED CONTENT)
                    ========================================================= */}

                    <DocSection id="introduction" title="Introduction">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">1. Create an Account</h4>
                                <p className="text-muted-foreground">
                                    Sign up on the platform using your email and create a secure password.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">2. Create Your First Project</h4>
                                <p className="text-muted-foreground">
                                    Navigate to the Projects section and click "New Project" to create your first workspace.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">3. Invite Team Members</h4>
                                <p className="text-muted-foreground">
                                    Add team members and assign them appropriate roles (Owner, Admin, or Member).
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">4. Start Creating Tasks</h4>
                                <p className="text-muted-foreground">
                                    Create tasks within your project and assign them to team members.
                                </p>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection id="requirements" title="System Requirements">
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                            <li>Stable internet connection</li>
                            <li>Email account for registration and notifications</li>
                            <li>Administrative access to invite team members</li>
                        </ul>
                    </DocSection>

                    <DocSection id="benefits" title="Key Benefits">
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Structured Project Lifecycle:</strong> Manage projects through defined states (active, completed, archived)</li>
                            <li><strong>Task Workflow Management:</strong> Track tasks across multiple statuses (pending, in progress, completed, cancelled)</li>
                            <li><strong>Role-Based Access Control:</strong> Flexible permission system with Owner, Admin, and Member roles</li>
                            <li><strong>Complete Activity Transparency:</strong> Audit trail of all team actions for accountability</li>
                            <li><strong>Real-Time Collaboration:</strong> Comment on tasks and share updates with team members</li>
                            <li><strong>Secure Authentication:</strong> JWT-based security with automatic token refresh</li>
                        </ul>
                    </DocSection>

                    <DocSection id="projects" title="Projects Management">
                        <div className="space-y-4">
                            <p>
                                Projects are the top-level organizational units in ProjectMaster. Each project represents a distinct
                                workspace or initiative that can have its own tasks, team members, and activity history.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Project Lifecycle States:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Active:</strong> Ongoing projects that are currently in progress</li>
                                    <li><strong>Completed:</strong> Successfully finished projects</li>
                                    <li><strong>Archived:</strong> Inactive projects kept for historical reference</li>
                                </ul>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Project owners can create, update, and manage the lifecycle of their projects.
                                All team members can view projects they are members of.
                            </p>
                        </div>
                    </DocSection>

                    <DocSection id="tasks" title="Tasks & Workflow">
                        <div className="space-y-4">
                            <p>
                                Tasks are actionable items within projects. They allow teams to break down projects into manageable
                                work items, track progress, and collaborate on deliverables.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Task Status Workflow:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Pending:</strong> Task created but not yet started</li>
                                    <li><strong>In Progress:</strong> Task is actively being worked on</li>
                                    <li><strong>Completed:</strong> Task is finished and ready for review</li>
                                    <li><strong>Cancelled:</strong> Task is no longer needed and removed from workflow</li>
                                </ul>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Each task includes a title, description, due date, priority level,
                                and can be assigned to specific team members.
                            </p>
                        </div>
                    </DocSection>

                    <DocSection id="collaboration" title="Team Collaboration">
                        <div className="space-y-4">
                            <p>
                                ProjectMaster enables seamless team collaboration through multiple features that keep everyone informed and aligned.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                <div>
                                    <h4 className="font-semibold mb-1">Task Comments</h4>
                                    <p className="text-sm">
                                        Team members can comment on tasks to discuss implementation details,
                                        provide updates, and share feedback.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Project Membership</h4>
                                    <p className="text-sm">
                                        Invite team members to projects and assign them specific roles that define their permissions and responsibilities.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Real-Time Updates</h4>
                                    <p className="text-sm">
                                        See live updates when team members create tasks, update statuses, or leave comments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection id="activity" title="Activity Tracking">
                        <div className="space-y-4">
                            <p>
                                Every significant action in ProjectMaster is logged in the activity system,
                                providing complete transparency and accountability across all projects.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Activity Log Includes:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Project creation, updates, and status changes</li>
                                    <li>Task assignments and status transitions</li>
                                    <li>Team member additions and role changes</li>
                                    <li>Comments and task updates</li>
                                    <li>Timestamps and user information for each action</li>
                                </ul>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Activity logs are accessible to all project members,
                                with details including who made the change, what was changed, and when it occurred.
                            </p>
                        </div>
                    </DocSection>

                    {/* Continue exactly same for remaining sections... */}
                    <DocSection id="roles" title="Roles & Permissions">
                        <div className="space-y-4">
                            <p>
                                ProjectMaster implements a three-tier role-based access control system
                                that allows granular management of team permissions.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Owner</h4>
                                    <p className="text-sm">
                                        Has complete control over a project including creating, editing,
                                        deleting tasks, managing team members, and transferring ownership.
                                        Owners can change project status and manage all permissions.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Admin</h4>
                                    <p className="text-sm">
                                        Can manage day-to-day operations including creating and updating tasks,
                                        managing team members, and delegating work.
                                        Cannot transfer ownership or delete the project.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Member</h4>
                                    <p className="text-sm">
                                        Can view project information, work on assigned tasks,
                                        comment on tasks, and update their own task statuses.
                                        Cannot modify project settings or team member roles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection id="authentication" title="Authentication">
                        <div className="space-y-4">
                            <p>
                                ProjectMaster uses industry-standard JWT (JSON Web Token) based authentication
                                to ensure secure access to your account and data.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Security Features:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Secure Password Storage:</strong> Passwords are hashed using bcrypt</li>
                                    <li><strong>JWT Tokens:</strong> Access tokens provide secure session management</li>
                                    <li><strong>Token Refresh:</strong> Automatic token refresh mechanism maintains session security</li>
                                    <li><strong>HTTP-Only Cookies:</strong> Tokens stored securely in HTTP-only cookies</li>
                                    <li><strong>CORS Protection:</strong> Cross-origin requests are properly validated</li>
                                </ul>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your login credentials are encrypted in transit using HTTPS.
                            </p>
                        </div>
                    </DocSection>

                    <DocSection id="user-management" title="User Management">
                        <div className="space-y-4">
                            <p>
                                Manage your user profile and account settings to personalize your experience.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                <div>
                                    <h4 className="font-semibold mb-1">Profile Management</h4>
                                    <p className="text-sm">
                                        Update your full name, email, avatar, phone number, and bio.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Email Verification</h4>
                                    <p className="text-sm">
                                        All accounts require email verification during signup.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Project Membership</h4>
                                    <p className="text-sm">
                                        View all projects you're a member of, along with your role.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection id="api-overview" title="API Overview">
                        <div className="space-y-4">
                            <p>
                                ProjectMaster provides a comprehensive RESTful API for integrations.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Available Resources:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><code className="bg-background px-2 py-1 rounded">/auth</code></li>
                                    <li><code className="bg-background px-2 py-1 rounded">/projects</code></li>
                                    <li><code className="bg-background px-2 py-1 rounded">/tasks</code></li>
                                    <li><code className="bg-background px-2 py-1 rounded">/comments</code></li>
                                    <li><code className="bg-background px-2 py-1 rounded">/activity</code></li>
                                    <li><code className="bg-background px-2 py-1 rounded">/users</code></li>
                                </ul>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection id="api-examples" title="API Examples">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">Create a Project</h4>
                                <CodeBlock>
                                    {`POST /projects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete website overhaul for 2025"
}`}
                                </CodeBlock>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection id="best-practices" title="Best Practices">
                        <div className="space-y-4">
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                <li>Use clear naming conventions</li>
                                <li>Break projects into smaller tasks</li>
                                <li>Keep authentication tokens secure</li>
                            </ul>
                        </div>
                    </DocSection>

                    {/* NEXT / PREVIOUS & CTA */}
                    <div className="space-y-8 pt-16 border-t">
                        <div className="flex justify-between">
                            {prevDoc ? (
                                <a href={`#${prevDoc.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    ← {prevDoc.label}
                                </a>
                            ) : <div />}

                            {nextDoc && (
                                <a href={`#${nextDoc.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {nextDoc.label} →
                                </a>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">Ready to get started?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Create your workspace and start managing projects like a pro.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Create Workspace
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </main>

                {/* RIGHT SIDEBAR */}
                <aside className="hidden xl:block w-64 border-l bg-background/50 px-6 py-8 sticky top-[57px] self-start max-h-[calc(100vh-57px)] overflow-y-auto">
                    <div className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                        On This Page
                    </div>
                    <ul className="space-y-3 text-sm">
                        {flatDocs.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className={`block px-3 py-2 rounded-lg transition-all ${activeSection === item.id
                                        ? "text-primary font-semibold bg-primary/10"
                                        : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                        }`}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                {showBackToTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-all z-30"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                )}

            </div>
        </div>
    );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

interface DocSectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

function DocSection({ id, title, children }: DocSectionProps) {
    return (
        <motion.section
            id={id}
            className="scroll-mt-24 space-y-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-3xl font-bold">{title}</h2>
            <div className="text-muted-foreground leading-relaxed">
                {children}
            </div>
        </motion.section>
    );
}

interface CodeBlockProps {
    children: string;
}

function CodeBlock({ children }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm text-slate-100"
                title="Copy to clipboard"
            >
                {copied ? (
                    <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Copy</span>
                    </>
                )}
            </button>

            <pre className="bg-slate-900 text-slate-100 text-sm rounded-lg p-6 overflow-x-auto">
                <code>{children}</code>
            </pre>
        </div>
    );
}
