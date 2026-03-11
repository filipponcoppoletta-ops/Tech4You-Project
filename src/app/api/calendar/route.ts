import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Format date to iCal standard (YYYYMMDDTHHMMSSZ)
function formatICalDate(dateStr: string, isEndOfDay = false) {
    const date = new Date(dateStr);
    if (isEndOfDay) {
        date.setUTCHours(23, 59, 59);
    } else {
        date.setUTCHours(0, 0, 0);
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICalContent(projectInfo: Record<string, string | null>, phases: Record<string, string>[]) {
    const events: string[] = [];
    const now = formatICalDate(new Date().toISOString());

    // Project Events
    if (projectInfo?.start_date) {
        events.push(
            'BEGIN:VEVENT',
            `UID:proj-start-${projectInfo.id}`,
            `DTSTAMP:${now}`,
            `DTSTART:${formatICalDate(projectInfo.start_date)}`,
            `DTEND:${formatICalDate(projectInfo.start_date, true)}`,
            `SUMMARY:Start Project: ${projectInfo.title}`,
            `DESCRIPTION:Project Kickoff for ${projectInfo.title}`,
            'END:VEVENT'
        );
    }
    if (projectInfo?.end_date) {
        events.push(
            'BEGIN:VEVENT',
            `UID:proj-end-${projectInfo.id}`,
            `DTSTAMP:${now}`,
            `DTSTART:${formatICalDate(projectInfo.end_date)}`,
            `DTEND:${formatICalDate(projectInfo.end_date, true)}`,
            `SUMMARY:Deadline: ${projectInfo.title}`,
            `DESCRIPTION:Final Deadline for ${projectInfo.title}`,
            'END:VEVENT'
        );
    }

    // Phases Events
    phases.forEach(p => {
        events.push(
            'BEGIN:VEVENT',
            `UID:phase-start-${p.id}`,
            `DTSTAMP:${now}`,
            `DTSTART:${formatICalDate(p.start_date)}`,
            `DTEND:${formatICalDate(p.start_date, true)}`,
            `SUMMARY:Start Phase: ${p.name}`,
            `DESCRIPTION:Beginning of phase ${p.name}`,
            'END:VEVENT'
        );
        events.push(
            'BEGIN:VEVENT',
            `UID:phase-end-${p.id}`,
            `DTSTAMP:${now}`,
            `DTSTART:${formatICalDate(p.end_date)}`,
            `DTEND:${formatICalDate(p.end_date, true)}`,
            `SUMMARY:Deadline Phase: ${p.name}`,
            `DESCRIPTION:Deadline for phase ${p.name}`,
            'END:VEVENT'
        );
    });

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Tech4You//PM Dashboard//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Tech4You PM Calendar',
        'X-WR-TIMEZONE:Europe/Rome',
        ...events,
        'END:VCALENDAR'
    ].join('\r\n');
}

export async function GET() {
    try {
        // Using standard supabase-js client because calendar apps don't send Next.js cookies
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const PROJECT_ID = '00000000-0000-0000-0000-000000000001';

        const [projectRes, phasesRes] = await Promise.all([
            supabase.from('project_info').select('*').eq('id', PROJECT_ID).single(),
            supabase.from('phases').select('*').eq('project_id', PROJECT_ID)
        ]);

        const icalContent = generateICalContent(
            projectRes.data,
            phasesRes.data || []
        );

        return new NextResponse(icalContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': 'attachment; filename="pm_dashboard.ics"',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (e: unknown) {
        console.error("Failed to generate ICS:", e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
