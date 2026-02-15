'use client';

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Users,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import FullSystemDemo from "@/components/landing/FullSystemDemo";
import SpotlightCard from "@/components/landing/SpotlightCard";
import Reveal from "@/components/landing/Reveal";
import ThemeToggle from "@/components/theme-toggle";

export default function Home() {
  const { scrollY } = useScroll();

  const ySlow = useTransform(scrollY, [0, 500], [0, -80]);
  const yFast = useTransform(scrollY, [0, 500], [0, -160]);

  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.85]);

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="font-bold text-xl tracking-tight">
            ProjectMaster
          </div>

          <div className="hidden md:flex gap-8 text-sm text-muted-foreground">
            <Link href="#platform">Platform</Link>
            <Link href="#governance">Governance</Link>
            <Link href="#teams">Teams</Link>
            <Link href="#docs">Docs</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="gap-2 shadow-soft">
                Create Workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

        </div>
      </nav>

      <main className="flex-1 pt-40 space-y-40">

        {/* HERO */}
        <section className="relative text-center px-6 overflow-hidden">

          <motion.div
            style={{ y: ySlow }}
            className="absolute left-1/4 top-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            style={{ y: yFast }}
            className="absolute right-1/4 top-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"
          />

          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Structured Project Governance
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Enterprise-grade project
              <br />
              control for modern teams.
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Role-based collaboration, lifecycle governance,
              structured task workflows, and complete activity visibility —
              built for startups and engineering organizations that require clarity.
            </p>

            <div className="flex justify-center gap-6 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 w-56 shadow-blue-glow font-semibold">
                  Create Workspace
                </Button>
              </Link>

              <Link href="#platform">
                <Button size="lg" variant="outline" className="h-14 w-56 font-semibold">
                  Explore Platform
                </Button>
              </Link>
            </div>

          </motion.div>
        </section>

        {/* FULL SYSTEM DEMO */}
        <FullSystemDemo />

        {/* PLATFORM */}
        <Reveal>
          <section id="platform" className="px-6 scroll-mt-32">
            <div className="max-w-6xl mx-auto space-y-16">

              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold">
                  Built for structured execution.
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Workflow control, role clarity,
                  and lifecycle governance in one unified platform.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Feature icon={<Layers />} title="Project Lifecycle Control"
                  text="Active, completed, and archived states ensure structured governance." />
                <Feature icon={<Users />} title="Role-Based Access"
                  text="Owner, Admin, and Member roles enforce accountability." />
                <Feature icon={<Activity />} title="Activity Transparency"
                  text="Every action is logged to maintain visibility." />
              </div>

            </div>
          </section>
        </Reveal>

        {/* GOVERNANCE */}
        <section id="governance" className="px-6 scroll-mt-32">
          <div className="max-w-5xl mx-auto space-y-12 text-center">

            <h2 className="text-4xl font-bold">
              Governance embedded at the core.
            </h2>

            <div className="grid md:grid-cols-3 gap-10 text-left">
              <GovernanceItem text="Granular role permissions per project" />
              <GovernanceItem text="Secure JWT authentication architecture" />
              <GovernanceItem text="Project-level audit logs & activity records" />
            </div>

          </div>
        </section>

        {/* TEAMS */}
        <section id="teams" className="px-6 scroll-mt-32">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">

            <div className="space-y-6">
              <h3 className="text-3xl font-bold">For Startup Teams</h3>
              <p className="text-muted-foreground leading-relaxed">
                Move quickly without losing structure. Assign ownership,
                track deliverables, and maintain clarity as your team scales.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold">For Engineering Organizations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enforce role-based governance, monitor lifecycle states,
                and maintain complete activity transparency across projects.
              </p>
            </div>

          </div>
        </section>

        {/* DOCS */}
        <section id="docs" className="px-6 scroll-mt-32 text-center">
          <div className="max-w-3xl mx-auto space-y-8">

            <h2 className="text-4xl font-bold">
              Built with modern SaaS architecture.
            </h2>

            <p className="text-muted-foreground">
              Next.js frontend, NestJS backend, Prisma ORM,
              PostgreSQL database — structured for scalable, production-grade SaaS.
            </p>

            <Link href="/docs">
              <Button variant="outline" className="gap-2">
                View Developer Documentation
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>

          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-32">
          <div className="max-w-4xl mx-auto text-center rounded-3xl bg-primary p-16 text-primary-foreground space-y-6 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Ready to structure your workflow?
            </h2>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 w-64 font-semibold">
                Create Your Workspace
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t py-12 text-center text-sm text-muted-foreground">
        © 2026 ProjectMaster · Privacy · Terms · Status
      </footer>

    </div>
  );
}

/* ---------- Components ---------- */

function Feature({ icon, title, text }: any) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200 }}>
      <SpotlightCard>
        <div className="space-y-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="font-bold text-xl">{title}</h3>
          <p className="text-muted-foreground">{text}</p>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function GovernanceItem({ text }: any) {
  return (
    <div className="flex items-center gap-3">
      <Shield className="h-5 w-5 text-primary" />
      <span>{text}</span>
    </div>
  );
}
