/* ==========================================
   NEST TRACKER
   PART 1 - CORE SYSTEM
========================================== */

/* ---------- STORAGE ---------- */

const STORAGE_KEY = "nestTrackerData";

const defaultData = {
    studySessions: [],
    mockTests: [],
    goalHours: 0,
    streak: 0
};

function getData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultData)
        );

        return structuredClone(defaultData);
    }

    return JSON.parse(saved);
}

function saveData(data) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

let appData = getData();

/* ---------- DOM ---------- */

const totalHoursEl =
    document.getElementById("totalHours");

const todayHoursEl =
    document.getElementById("todayHours");

const totalMocksEl =
    document.getElementById("totalMocks");

const bestScoreEl =
    document.getElementById("bestScore");

const streakCountEl =
    document.getElementById("streakCount");

/* Subject Cards */

const physicsHoursEl =
    document.getElementById("physicsHours");

const chemistryHoursEl =
    document.getElementById("chemistryHours");

const mathHoursEl =
    document.getElementById("mathHours");

const biologyHoursEl =
    document.getElementById("biologyHours");

const mockHoursEl =
    document.getElementById("mockHours");

/* Inputs */

const subjectSelect =
    document.getElementById("subjectSelect");

const hoursInput =
    document.getElementById("hoursInput");

const addStudyBtn =
    document.getElementById("addStudyBtn");

/* Activity */

const activityList =
    document.getElementById("activityList");

/* ---------- HELPERS ---------- */

function todayDateString() {
    return new Date()
        .toISOString()
        .split("T")[0];
}

function round(value) {
    return Math.round(value * 10) / 10;
}

/* ---------- SUBJECT TOTALS ---------- */

function getSubjectHours(subject) {

    return round(
        appData.studySessions
            .filter(
                s => s.subject === subject
            )
            .reduce(
                (sum, s) => sum + Number(s.hours),
                0
            )
    );
}

function getTotalHours() {

    return round(
        appData.studySessions.reduce(
            (sum, s) =>
                sum + Number(s.hours),
            0
        )
    );
}

function getTodayHours() {

    const today = todayDateString();

    return round(
        appData.studySessions
            .filter(
                s => s.date === today
            )
            .reduce(
                (sum, s) =>
                    sum + Number(s.hours),
                0
            )
    );
}

/* ---------- MOCK STATS ---------- */

function getBestMockScore() {

    if (
        appData.mockTests.length === 0
    ) {
        return 0;
    }

    return Math.max(
        ...appData.mockTests.map(
            m => Number(m.score)
        )
    );
}

/* ---------- ACTIVITY FEED ---------- */

function renderActivity() {

    if (!activityList) return;

    activityList.innerHTML = "";

    const latest = [
        ...appData.studySessions.map(
            s => ({
                type: "study",
                date: s.date,
                text:
                    `${s.subject} • ${s.hours} hrs`
            })
        ),

        ...appData.mockTests.map(
            m => ({
                type: "mock",
                date: m.date,
                text:
                    `${m.name} • ${m.score}`
            })
        )
    ];

    latest.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

    latest
        .slice(0, 10)
        .forEach(item => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "activity-item";

            div.innerHTML = `
                <strong>
                    ${
                        item.type === "study"
                            ? "📚 Study"
                            : "📝 Mock"
                    }
                </strong>
                <br>
                <span>
                    ${item.text}
                </span>
            `;

            activityList.appendChild(div);
        });
}

/* ---------- DASHBOARD ---------- */

function updateDashboard() {

    totalHoursEl.textContent =
        getTotalHours();

    todayHoursEl.textContent =
        getTodayHours();

    totalMocksEl.textContent =
        appData.mockTests.length;

    bestScoreEl.textContent =
        getBestMockScore();

    streakCountEl.textContent =
        appData.streak || 0;

    physicsHoursEl.textContent =
        getSubjectHours("Physics");

    chemistryHoursEl.textContent =
        getSubjectHours("Chemistry");

    mathHoursEl.textContent =
        getSubjectHours("Mathematics");

    biologyHoursEl.textContent =
        getSubjectHours("Biology");

    mockHoursEl.textContent =
        getSubjectHours("Mock Test");

    renderActivity();
}

/* ---------- STUDY LOG ---------- */

function addStudySession() {

    const subject =
        subjectSelect.value;

    const hours =
        Number(hoursInput.value);

    if (
        !hours ||
        hours <= 0
    ) {
        alert(
            "Enter valid hours."
        );
        return;
    }

    appData.studySessions.push({
        subject,
        hours,
        date: todayDateString()
    });

    saveData(appData);

    hoursInput.value = "";

    updateDashboard();

    if (
        typeof updateCharts ===
        "function"
    ) {
        updateCharts();
    }

    if (
        typeof updateGoalProgress ===
        "function"
    ) {
        updateGoalProgress();
    }
}

addStudyBtn?.addEventListener(
    "click",
    addStudySession
);

/* ---------- INITIAL LOAD ---------- */

updateDashboard();

console.log(
    "Part 1 Loaded Successfully"
);

/* ==========================================
   PART 2 - MOCK TESTS + GOALS + STREAKS
========================================== */

/* ---------- DOM ---------- */

const mockNameInput =
    document.getElementById("mockName");

const mockScoreInput =
    document.getElementById("mockScore");

const addMockBtn =
    document.getElementById("addMockBtn");

const mockTableBody =
    document.getElementById("mockTableBody");

const goalInput =
    document.getElementById("goalInput");

const saveGoalBtn =
    document.getElementById("saveGoalBtn");

const goalFill =
    document.getElementById("goalFill");

const goalText =
    document.getElementById("goalText");

/* ---------- MOCK TABLE ---------- */

function renderMockTable() {

    if (!mockTableBody) return;

    mockTableBody.innerHTML = "";

    const sortedMocks =
        [...appData.mockTests].reverse();

    sortedMocks.forEach((mock, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${mock.date}</td>
            <td>${mock.name}</td>
            <td>${mock.score}</td>
        `;

        mockTableBody.appendChild(row);
    });
}

/* ---------- ADD MOCK ---------- */

function addMockTest() {

    const name =
        mockNameInput.value.trim();

    const score =
        Number(mockScoreInput.value);

    if (!name) {
        alert("Enter mock name");
        return;
    }

    if (isNaN(score)) {
        alert("Enter score");
        return;
    }

    appData.mockTests.push({
        name,
        score,
        date: todayDateString()
    });

    saveData(appData);

    mockNameInput.value = "";
    mockScoreInput.value = "";

    renderMockTable();
    updateDashboard();

    if (
        typeof updateCharts ===
        "function"
    ) {
        updateCharts();
    }
}

addMockBtn?.addEventListener(
    "click",
    addMockTest
);

/* ---------- GOALS ---------- */

function saveGoal() {

    const value =
        Number(goalInput.value);

    if (
        isNaN(value) ||
        value <= 0
    ) {
        alert(
            "Enter valid target hours"
        );
        return;
    }

    appData.goalHours = value;

    saveData(appData);

    updateGoalProgress();

    alert("Goal Saved");
}

saveGoalBtn?.addEventListener(
    "click",
    saveGoal
);

/* ---------- GOAL PROGRESS ---------- */

function updateGoalProgress() {

    if (!goalFill) return;

    const totalHours =
        getTotalHours();

    const goal =
        Number(
            appData.goalHours || 0
        );

    if (goal <= 0) {

        goalFill.style.width = "0%";

        goalText.textContent =
            "Set a study goal";

        return;
    }

    const percent =
        Math.min(
            100,
            (totalHours / goal) * 100
        );

    goalFill.style.width =
        percent + "%";

    goalText.textContent =
        `${totalHours} / ${goal} hrs (${percent.toFixed(1)}%)`;
}

/* ---------- STREAK SYSTEM ---------- */

function calculateStreak() {

    const dates =
        [...new Set(
            appData.studySessions.map(
                s => s.date
            )
        )];

    if (dates.length === 0) {

        appData.streak = 0;

        saveData(appData);

        return;
    }

    dates.sort(
        (a, b) =>
            new Date(b) -
            new Date(a)
    );

    let streak = 1;

    let current =
        new Date(dates[0]);

    for (
        let i = 1;
        i < dates.length;
        i++
    ) {

        const next =
            new Date(dates[i]);

        const diffDays =
            Math.round(
                (
                    current - next
                ) /
                (1000 * 60 * 60 * 24)
            );

        if (diffDays === 1) {

            streak++;

            current = next;

        } else {

            break;
        }
    }

    appData.streak = streak;

    saveData(appData);
}

/* ---------- REFRESH ---------- */

function refreshEverything() {

    calculateStreak();

    updateDashboard();

    renderMockTable();

    updateGoalProgress();

    if (
        typeof updateCharts ===
        "function"
    ) {
        updateCharts();
    }
}

/* ---------- INITIAL LOAD ---------- */

if (goalInput) {

    goalInput.value =
        appData.goalHours || "";
}

refreshEverything();

console.log(
    "Part 2 Loaded Successfully"
);

/* ==========================================
   PART 3 - CHARTS (Chart.js)
========================================== */

/* ---------- CHART DOM ---------- */

const subjectChartCanvas =
    document.getElementById(
        "subjectChart"
    );

const progressChartCanvas =
    document.getElementById(
        "progressChart"
    );

/* ---------- CHART INSTANCES ---------- */

let subjectChart = null;
let progressChart = null;

/* ---------- SUBJECT DATA ---------- */

function buildSubjectDataset() {

    return [
        getSubjectHours("Physics"),
        getSubjectHours("Chemistry"),
        getSubjectHours("Mathematics"),
        getSubjectHours("Biology"),
        getSubjectHours("Mock Test")
    ];
}

/* ---------- DAILY TOTALS ---------- */

function buildDailyProgress() {

    const map = {};

    appData.studySessions.forEach(
        session => {

            const date =
                session.date;

            if (!map[date]) {
                map[date] = 0;
            }

            map[date] +=
                Number(session.hours);
        }
    );

    const labels =
        Object.keys(map).sort();

    const values =
        labels.map(
            date =>
                Math.round(
                    map[date] * 10
                ) / 10
        );

    return {
        labels,
        values
    };
}

/* ---------- SUBJECT CHART ---------- */

function createSubjectChart() {

    if (!subjectChartCanvas)
        return;

    if (subjectChart) {
        subjectChart.destroy();
    }

    subjectChart =
        new Chart(
            subjectChartCanvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Physics",
                        "Chemistry",
                        "Mathematics",
                        "Biology",
                        "Mock Test"
                    ],

                    datasets: [
                        {
                            data:
                                buildSubjectDataset(),

                            backgroundColor: [
                                "#6d8cff",
                                "#8d6bff",
                                "#32d583",
                                "#ffb020",
                                "#ff5d73"
                            ],

                            borderWidth: 0
                        }
                    ]
                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            labels: {
                                color:
                                    "#f5f7ff"
                            }
                        }
                    }
                }
            }
        );
}

/* ---------- PROGRESS CHART ---------- */

function createProgressChart() {

    if (!progressChartCanvas)
        return;

    if (progressChart) {
        progressChart.destroy();
    }

    const progress =
        buildDailyProgress();

    progressChart =
        new Chart(
            progressChartCanvas,
            {
                type: "line",

                data: {

                    labels:
                        progress.labels,

                    datasets: [
                        {
                            label:
                                "Hours Studied",

                            data:
                                progress.values,

                            borderColor:
                                "#6d8cff",

                            backgroundColor:
                                "rgba(109,140,255,.15)",

                            fill: true,

                            tension: 0.3
                        }
                    ]
                },

                options: {

                    responsive: true,

                    scales: {

                        x: {

                            ticks: {
                                color:
                                    "#9ea6c0"
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.05)"
                            }
                        },

                        y: {

                            beginAtZero:
                                true,

                            ticks: {
                                color:
                                    "#9ea6c0"
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.05)"
                            }
                        }
                    },

                    plugins: {

                        legend: {

                            labels: {
                                color:
                                    "#f5f7ff"
                            }
                        }
                    }
                }
            }
        );
}

/* ---------- MASTER UPDATE ---------- */

function updateCharts() {

    createSubjectChart();

    createProgressChart();
}

/* ---------- INITIAL LOAD ---------- */

updateCharts();

console.log(
    "Part 3 Loaded Successfully"
);

/* ==========================================
   PART 4 - POMODORO TIMER
========================================== */

/* ---------- DOM ---------- */

const timerDisplay =
    document.getElementById(
        "timerDisplay"
    );

const startTimerBtn =
    document.getElementById(
        "startTimer"
    );

const pauseTimerBtn =
    document.getElementById(
        "pauseTimer"
    );

const resetTimerBtn =
    document.getElementById(
        "resetTimer"
    );

/* ---------- STORAGE ---------- */

const TIMER_KEY =
    "nestTrackerTimer";

/* ---------- DEFAULT TIMER ---------- */

const DEFAULT_SECONDS =
    25 * 60;

/* ---------- STATE ---------- */

let timerInterval = null;

let timerState = loadTimerState();

/* ---------- LOAD ---------- */

function loadTimerState() {

    const saved =
        localStorage.getItem(
            TIMER_KEY
        );

    if (!saved) {

        return {
            seconds:
                DEFAULT_SECONDS,
            running: false
        };
    }

    try {

        return JSON.parse(saved);

    } catch {

        return {
            seconds:
                DEFAULT_SECONDS,
            running: false
        };
    }
}

/* ---------- SAVE ---------- */

function saveTimerState() {

    localStorage.setItem(
        TIMER_KEY,
        JSON.stringify(
            timerState
        )
    );
}

/* ---------- FORMAT ---------- */

function formatTime(
    totalSeconds
) {

    const mins =
        Math.floor(
            totalSeconds / 60
        );

    const secs =
        totalSeconds % 60;

    return (
        String(mins).padStart(
            2,
            "0"
        ) +
        ":" +
        String(secs).padStart(
            2,
            "0"
        )
    );
}

/* ---------- DISPLAY ---------- */

function updateTimerDisplay() {

    if (!timerDisplay)
        return;

    timerDisplay.textContent =
        formatTime(
            timerState.seconds
        );

    saveTimerState();
}

/* ---------- COMPLETE ---------- */

function timerFinished() {

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    timerState.running =
        false;

    timerState.seconds =
        DEFAULT_SECONDS;

    saveTimerState();

    updateTimerDisplay();

    try {

        const audio =
            new Audio(
                "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
            );

        audio.play();

    } catch (e) {
        console.log(
            "Audio blocked"
        );
    }

    alert(
        "🎉 Pomodoro Complete!\nTake a short break."
    );
}

/* ---------- START ---------- */

function startTimer() {

    if (
        timerInterval !== null
    ) {
        return;
    }

    timerState.running =
        true;

    saveTimerState();

    timerInterval =
        setInterval(() => {

            timerState.seconds--;

            updateTimerDisplay();

            if (
                timerState.seconds <=
                0
            ) {

                timerFinished();
            }

        }, 1000);
}

/* ---------- PAUSE ---------- */

function pauseTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    timerState.running =
        false;

    saveTimerState();
}

/* ---------- RESET ---------- */

function resetTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    timerState.running =
        false;

    timerState.seconds =
        DEFAULT_SECONDS;

    saveTimerState();

    updateTimerDisplay();
}

/* ---------- EVENTS ---------- */

startTimerBtn?.addEventListener(
    "click",
    startTimer
);

pauseTimerBtn?.addEventListener(
    "click",
    pauseTimer
);

resetTimerBtn?.addEventListener(
    "click",
    resetTimer
);

/* ---------- RESTORE ---------- */

function restoreTimer() {

    updateTimerDisplay();

    if (
        timerState.running
    ) {

        startTimer();
    }
}

restoreTimer();

console.log(
    "Part 4 Loaded Successfully"
);

/* ==========================================
   PART 5 - BACKUP / RESTORE
   + FINAL INITIALIZATION
========================================== */

/* ---------- DOM ---------- */

const exportBtn =
    document.getElementById(
        "exportBtn"
    );

const importBtn =
    document.getElementById(
        "importBtn"
    );

const importFile =
    document.getElementById(
        "importFile"
    );

/* ---------- EXPORT ---------- */

function exportData() {

    const backup = {

        exportedAt:
            new Date().toISOString(),

        version: "1.0",

        data: appData
    };

    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    const today =
        todayDateString();

    a.href = url;

    a.download =
        `nest-tracker-backup-${today}.json`;

    document.body.appendChild(
        a
    );

    a.click();

    a.remove();

    URL.revokeObjectURL(url);
}

/* ---------- IMPORT ---------- */

function importData(
    event
) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            try {

                const parsed =
                    JSON.parse(
                        e.target.result
                    );

                if (
                    !parsed.data
                ) {

                    throw new Error(
                        "Invalid file"
                    );
                }

                const confirmRestore =
                    confirm(
                        "Restore backup?\n\nCurrent data will be replaced."
                    );

                if (
                    !confirmRestore
                ) {
                    return;
                }

                appData =
                    parsed.data;

                saveData(
                    appData
                );

                refreshEverything();

                updateCharts();

                alert(
                    "Backup restored successfully."
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );

                alert(
                    "Invalid backup file."
                );
            }
        };

    reader.readAsText(
        file
    );
}

/* ---------- EVENTS ---------- */

exportBtn?.addEventListener(
    "click",
    exportData
);

importBtn?.addEventListener(
    "click",
    () => {

        importFile.click();
    }
);

importFile?.addEventListener(
    "change",
    importData
);

/* ---------- SAFETY CHECK ---------- */

function validateData() {

    if (
        !appData.studySessions
    ) {
        appData.studySessions =
            [];
    }

    if (
        !appData.mockTests
    ) {
        appData.mockTests =
            [];
    }

    if (
        !appData.goalHours
    ) {
        appData.goalHours =
            0;
    }

    if (
        !appData.streak
    ) {
        appData.streak =
            0;
    }

    saveData(appData);
}

/* ---------- WELCOME ---------- */

function firstRunCheck() {

    const key =
        "nestTrackerVisited";

    if (
        localStorage.getItem(
            key
        )
    ) {
        return;
    }

    localStorage.setItem(
        key,
        "true"
    );

    setTimeout(() => {

        alert(
`Welcome to NEST Tracker 🚀

Features:
• Study tracking
• Mock test history
• Goal progress
• Pomodoro timer
• Charts
• Backup & restore

Remember to export backups occasionally.`
        );

    }, 700);
}

/* ---------- FINAL BOOT ---------- */

function bootApp() {

    validateData();

    refreshEverything();

    updateCharts();

    updateGoalProgress();

    renderMockTable();

    firstRunCheck();
}

bootApp();

console.log(
    "%cNEST TRACKER READY 🚀",
    "color:#6d8cff;font-size:18px;font-weight:bold;"
);/* ==========================================
   PART 5 - BACKUP / RESTORE
   + FINAL INITIALIZATION
========================================== */

/* ---------- DOM ---------- */

const exportBtn =
    document.getElementById(
        "exportBtn"
    );

const importBtn =
    document.getElementById(
        "importBtn"
    );

const importFile =
    document.getElementById(
        "importFile"
    );

/* ---------- EXPORT ---------- */

function exportData() {

    const backup = {

        exportedAt:
            new Date().toISOString(),

        version: "1.0",

        data: appData
    };

    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    const today =
        todayDateString();

    a.href = url;

    a.download =
        `nest-tracker-backup-${today}.json`;

    document.body.appendChild(
        a
    );

    a.click();

    a.remove();

    URL.revokeObjectURL(url);
}

/* ---------- IMPORT ---------- */

function importData(
    event
) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            try {

                const parsed =
                    JSON.parse(
                        e.target.result
                    );

                if (
                    !parsed.data
                ) {

                    throw new Error(
                        "Invalid file"
                    );
                }

                const confirmRestore =
                    confirm(
                        "Restore backup?\n\nCurrent data will be replaced."
                    );

                if (
                    !confirmRestore
                ) {
                    return;
                }

                appData =
                    parsed.data;

                saveData(
                    appData
                );

                refreshEverything();

                updateCharts();

                alert(
                    "Backup restored successfully."
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );

                alert(
                    "Invalid backup file."
                );
            }
        };

    reader.readAsText(
        file
    );
}

/* ---------- EVENTS ---------- */

exportBtn?.addEventListener(
    "click",
    exportData
);

importBtn?.addEventListener(
    "click",
    () => {

        importFile.click();
    }
);

importFile?.addEventListener(
    "change",
    importData
);

/* ---------- SAFETY CHECK ---------- */

function validateData() {

    if (
        !appData.studySessions
    ) {
        appData.studySessions =
            [];
    }

    if (
        !appData.mockTests
    ) {
        appData.mockTests =
            [];
    }

    if (
        !appData.goalHours
    ) {
        appData.goalHours =
            0;
    }

    if (
        !appData.streak
    ) {
        appData.streak =
            0;
    }

    saveData(appData);
}

/* ---------- WELCOME ---------- */

function firstRunCheck() {

    const key =
        "nestTrackerVisited";

    if (
        localStorage.getItem(
            key
        )
    ) {
        return;
    }

    localStorage.setItem(
        key,
        "true"
    );

    setTimeout(() => {

        alert(
`Welcome to NEST Tracker 🚀

Features:
• Study tracking
• Mock test history
• Goal progress
• Pomodoro timer
• Charts
• Backup & restore

Remember to export backups occasionally.`
        );

    }, 700);
}

/* ---------- FINAL BOOT ---------- */

function bootApp() {

    validateData();

    refreshEverything();

    updateCharts();

    updateGoalProgress();

    renderMockTable();

    firstRunCheck();
}

bootApp();

console.log(
    "%cNEST TRACKER READY 🚀",
    "color:#6d8cff;font-size:18px;font-weight:bold;"
);