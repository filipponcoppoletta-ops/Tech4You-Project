import { TimelineSummary } from "@/components/TimelineSummary";
import { PhasesList } from "@/components/PhasesList";
import { Calendar } from "@/components/Calendar";
import { RemindersWidget } from "@/components/RemindersWidget";

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Overview</h1>
        <p className="text-muted-foreground mt-2">Monitor deadlines, phases, and resources for your projects.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Timeline & Phases */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
              Timeline Summary
            </h2>
            <TimelineSummary />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
              Project Phases
            </h2>
            <PhasesList />
          </section>
        </div>

        {/* Right Column: Calendar */}
        <div className="lg:col-span-1">
          <section className="h-full space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                Schedule
              </h2>
              <div className="sticky top-10">
                <Calendar />
              </div>
            </div>

            <div className="h-80">
              <RemindersWidget />
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
