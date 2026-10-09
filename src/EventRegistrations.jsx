import { useEffect, useState } from "react";
import { toast } from "sonner";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const ADMIN_KEY =
    import.meta.env.VITE_ADMIN_EXPORT_KEY || "";

export default function EventRegistrations() {

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");

    const [registrationData, setRegistrationData] = useState(null);

    const [eventsLoading, setEventsLoading] = useState(true);
    const [registrationsLoading, setRegistrationsLoading] =
        useState(false);

    const [downloading, setDownloading] = useState(false);


    // ============================================================
    // FETCH EVENTS
    // ============================================================

    useEffect(() => {
        fetchEvents();
    }, []);


    const fetchEvents = async () => {

        try {

            setEventsLoading(true);

            const response = await fetch(
                `${BACKEND_URL}/api/events`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch events: ${response.status}`
                );
            }

            const data = await response.json();

            const eventList = Array.isArray(data)
                ? data
                : data.events || [];

            setEvents(eventList);

        } catch (error) {

            console.error(
                "Fetch events error:",
                error
            );

            toast.error("Failed to load events");

        } finally {

            setEventsLoading(false);

        }
    };


    // ============================================================
    // EVENT CHANGE
    // ============================================================

    const handleEventChange = (e) => {

        setSelectedEvent(e.target.value);

        setRegistrationData(null);
    };


    // ============================================================
    // VIEW REGISTRATIONS
    // ============================================================

    const viewRegistrations = async () => {

        if (!selectedEvent) {
            toast.error("Please select an event");
            return;
        }

        if (!ADMIN_KEY) {
            toast.error("Admin key is missing");
            return;
        }

        try {

            setRegistrationsLoading(true);
            setRegistrationData(null);

            const url =
                `${BACKEND_URL}/api/admin/events/` +
                `${selectedEvent}/registrations/` +
                `${ADMIN_KEY}`;

            console.log("Fetching:", url);

            const response = await fetch(url);

            const data = await response.json();

            console.log(
                "Registration response:",
                data
            );

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to get registrations"
                );

            }

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to get registrations"
                );

            }

            setRegistrationData(data);

            toast.success(
                `${data.totalTeams} teams found`
            );

        } catch (error) {

            console.error(
                "Registration fetch error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to load registrations"
            );

        } finally {

            setRegistrationsLoading(false);

        }
    };


    // ============================================================
    // DOWNLOAD EXCEL
    // ============================================================

    const downloadExcel = async () => {

        if (!selectedEvent) {
            toast.error("Please select an event");
            return;
        }

        if (!ADMIN_KEY) {
            toast.error("Admin key is missing");
            return;
        }

        try {

            setDownloading(true);

            const url =
                `${BACKEND_URL}/api/admin/events/` +
                `${selectedEvent}/registrations/excel/` +
                `${ADMIN_KEY}`;

            const response = await fetch(url);

            if (!response.ok) {

                let message =
                    "Failed to download Excel";

                try {

                    const data =
                        await response.json();

                    message =
                        data.message ||
                        message;

                } catch {
                    // Not JSON
                }

                throw new Error(message);
            }

            const blob =
                await response.blob();

            const downloadUrl =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = downloadUrl;

            link.download =
                "Team_Registrations.xlsx";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                downloadUrl
            );

            toast.success(
                "Excel downloaded successfully"
            );

        } catch (error) {

            console.error(
                "Excel download error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to download Excel"
            );

        } finally {

            setDownloading(false);

        }
    };


    // ============================================================
    // CONVERT API DATA TO TABLE ROWS
    // ============================================================

    const getTableRows = () => {

        if (
            !registrationData ||
            !Array.isArray(registrationData.teams)
        ) {
            return [];
        }

        const rows = [];

        registrationData.teams.forEach(
            (team) => {

                // -------------------------------
                // LEADER ROW
                // -------------------------------

                if (team.leader) {

                    rows.push({
                        teamNumber: team.teamNumber,
                        role: "Leader",
                        rollNo: team.leader.rollNo,
                        name: team.leader.name,
                        email: team.leader.email,
                        phone: team.leader.phone
                    });

                }


                // -------------------------------
                // MEMBER ROWS
                // -------------------------------

                if (
                    Array.isArray(team.members)
                ) {

                    team.members.forEach(
                        (member) => {

                            rows.push({
                                teamNumber:
                                    team.teamNumber,

                                role: "Member",

                                rollNo:
                                    member.rollNo,

                                name:
                                    member.name,

                                email:
                                    member.email,

                                phone:
                                    member.phone
                            });

                        }
                    );

                }

            }
        );

        return rows;
    };


    const tableRows = getTableRows();


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <main className="min-h-screen bg-slate-950 text-white">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="border-b border-slate-800 bg-slate-950">

                <div className="mx-auto max-w-[1500px] px-6 py-7">

                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
                        INFOTREK 26
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Team Registrations
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Registration data in spreadsheet format
                    </p>

                </div>

            </div>


            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div className="mx-auto max-w-[1500px] px-6 py-8">


                {/* =================================================
                    CONTROLS
                ================================================= */}

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

                        {/* Event */}

                        <div className="w-full lg:max-w-xl">

                            <label
                                htmlFor="event"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Select Event
                            </label>

                            <select
                                id="event"
                                value={selectedEvent}
                                onChange={handleEventChange}
                                disabled={eventsLoading}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                            >

                                <option value="">
                                    {eventsLoading
                                        ? "Loading events..."
                                        : "Select an event"}
                                </option>

                                {events.map(
                                    (event) => (
                                        <option
                                            key={event._id}
                                            value={event._id}
                                        >
                                            {event.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        {/* View */}

                        <button
                            type="button"
                            onClick={viewRegistrations}
                            disabled={
                                !selectedEvent ||
                                registrationsLoading
                            }
                            className="rounded-lg bg-cyan-500 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {registrationsLoading
                                ? "Loading..."
                                : "View Registrations"}

                        </button>


                        {/* Download */}

                        <button
                            type="button"
                            onClick={downloadExcel}
                            disabled={
                                !selectedEvent ||
                                downloading
                            }
                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-7 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {downloading
                                ? "Downloading..."
                                : "Download Excel"}

                        </button>

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {registrationsLoading && (

                    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                        <p className="mt-4 text-sm text-slate-400">
                            Loading registrations...
                        </p>

                    </div>

                )}


                {/* =================================================
                    TABLE
                ================================================= */}

                {!registrationsLoading &&
                    registrationData && (

                        <div className="mt-6">


                            {/* TABLE HEADER */}

                            <div className="mb-4 flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-semibold">
                                        Registrations
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {registrationData.totalTeams}{" "}
                                        {registrationData.totalTeams === 1
                                            ? "team"
                                            : "teams"}
                                    </p>

                                </div>

                                <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">

                                    <span className="text-sm text-slate-400">
                                        Total Teams:{" "}
                                    </span>

                                    <span className="font-semibold text-white">
                                        {registrationData.totalTeams}
                                    </span>

                                </div>

                            </div>


                            {/* EMPTY */}

                            {tableRows.length === 0 ? (

                                <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">

                                    <p className="text-lg font-medium">
                                        No registrations found
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        No teams have registered for this event.
                                    </p>

                                </div>

                            ) : (

                                /* =================================================
                                   SPREADSHEET TABLE
                                ================================================= */

                                <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

                                    <div className="overflow-x-auto">

                                        <table className="w-full min-w-[950px] border-collapse text-left">

                                            {/* =====================================
                                                TABLE HEAD
                                            ===================================== */}

                                            <thead>

                                                <tr className="bg-slate-800">

                                                    <th className="border-b border-r border-slate-700 px-5 py-4 text-sm font-semibold text-slate-200">
                                                        Team
                                                    </th>

                                                    <th className="border-b border-r border-slate-700 px-5 py-4 text-sm font-semibold text-slate-200">
                                                        Role
                                                    </th>

                                                    <th className="border-b border-r border-slate-700 px-5 py-4 text-sm font-semibold text-slate-200">
                                                        Roll No
                                                    </th>

                                                    <th className="border-b border-r border-slate-700 px-5 py-4 text-sm font-semibold text-slate-200">
                                                        Name
                                                    </th>

                                                    <th className="border-b border-r border-slate-700 px-5 py-4 text-sm font-semibold text-slate-200">
                                                        Email
                                                    </th>

                                                    <th className="border-b border-slate-700 px-5 py-4 text-sm font-semibold text-slate-200">
                                                        Phone
                                                    </th>

                                                </tr>

                                            </thead>


                                            {/* =====================================
                                                TABLE BODY
                                            ===================================== */}

                                            <tbody>

                                                {tableRows.map(
                                                    (row, index) => {

                                                        const previousRow =
                                                            tableRows[index - 1];

                                                        const isNewTeam =
                                                            index === 0 ||
                                                            previousRow.teamNumber !==
                                                                row.teamNumber;

                                                        return (
                                                            <tr
                                                                key={`${row.teamNumber}-${row.role}-${row.rollNo}-${index}`}
                                                                className={`
                                                                    transition
                                                                    ${
                                                                        row.role ===
                                                                        "Leader"
                                                                            ? "bg-cyan-400/[0.06]"
                                                                            : "bg-slate-900"
                                                                    }
                                                                    hover:bg-slate-800
                                                                `}
                                                            >

                                                                {/* TEAM */}

                                                                <td
                                                                    className={`
                                                                        border-b border-r border-slate-800 px-5 py-4
                                                                        ${
                                                                            isNewTeam
                                                                                ? "font-bold text-cyan-400"
                                                                                : "text-slate-500"
                                                                        }
                                                                    `}
                                                                >

                                                                    {isNewTeam
                                                                        ? `Team ${row.teamNumber}`
                                                                        : `Team ${row.teamNumber}`}

                                                                </td>


                                                                {/* ROLE */}

                                                                <td className="border-b border-r border-slate-800 px-5 py-4">

                                                                    {row.role ===
                                                                    "Leader" ? (

                                                                        <span className="inline-flex rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                                                                            Leader
                                                                        </span>

                                                                    ) : (

                                                                        <span className="inline-flex rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                                                                            Member
                                                                        </span>

                                                                    )}

                                                                </td>


                                                                {/* ROLL NUMBER */}

                                                                <td className="border-b border-r border-slate-800 px-5 py-4 font-mono text-sm text-slate-300">

                                                                    {row.rollNo || "-"}

                                                                </td>


                                                                {/* NAME */}

                                                                <td className="border-b border-r border-slate-800 px-5 py-4 font-medium text-white">

                                                                    {row.name || "-"}

                                                                </td>


                                                                {/* EMAIL */}

                                                                <td className="border-b border-r border-slate-800 px-5 py-4 text-sm text-slate-300">

                                                                    {row.email || "-"}

                                                                </td>


                                                                {/* PHONE */}

                                                                <td className="border-b border-slate-800 px-5 py-4 font-mono text-sm text-slate-300">

                                                                    {row.phone || "-"}

                                                                </td>

                                                            </tr>
                                                        );

                                                    }
                                                )}

                                            </tbody>

                                        </table>

                                    </div>


                                    {/* =================================================
                                        TABLE FOOTER
                                    ================================================= */}

                                    <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-5 py-4">

                                        <p className="text-xs text-slate-500">
                                            Showing{" "}
                                            <span className="font-medium text-slate-300">
                                                {tableRows.length}
                                            </span>{" "}
                                            registered members
                                        </p>

                                        <button
                                            type="button"
                                            onClick={downloadExcel}
                                            disabled={downloading}
                                            className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
                                        >

                                            {downloading
                                                ? "Downloading..."
                                                : "↓ Download Excel"}

                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                    )}


                {/* =================================================
                    INITIAL STATE
                ================================================= */}

                {!registrationsLoading &&
                    !registrationData && (

                        <div className="mt-6 rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-20 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-2xl">
                                📊
                            </div>

                            <h2 className="mt-5 text-lg font-semibold">
                                Select an event
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                Select an event above to view its
                                registrations in spreadsheet format.
                            </p>

                        </div>

                    )}

            </div>

        </main>
    );
}