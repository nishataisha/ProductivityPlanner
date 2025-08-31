import "./styles.css";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckSquare,
  DollarSign,
  BookOpen,
  Plus,
  Check,
  Edit2,
  Save,
  Target,
  Star,
  Trash2,
  X,
} from "lucide-react";

import SpotifyPlayer from "./SpotifyPlayer";

//Type definitions
interface Project {
  id: number;
  name: string;
  objective: string;
  checkpoints: Array<{ id: number; text: string; completed: boolean }>;
  category: string;
}

interface NotesArchiveData {
  month: number;
  monthName: string;
  year: number;
  notes: string;
  hasContent: boolean;
}

interface JournalDay {
  day: number;
  date: Date;
  content: string;
  mood: string;
  energy: number;
  weather: string;
  hasContent: boolean;
}

interface JournalArchiveData {
  month: number;
  monthName: string;
  year: number;
  weeks: JournalDay[][];
  hasContent: boolean;
}

interface HistoricalData {
  year: number;
  month: number;
  notes: string;
  expenses: Expense[];
  totalExpenses: number;
}

interface Checkpoint {
  id: number;
  text: string;
  completed: boolean;
}

interface ProcessTracker {
  id: number;
  name: string;
  process: number;
  color: string;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface DayData {
  todos?: Todo[];
  habits?: Record<number, boolean>;
}

interface WeeklyEvent {
  day: number;
  title: string;
  color: string;
}

type MonthlyChecklistType = {
  reading: boolean[];
  journaling: boolean[];
};

interface NewExpense {
  category: string;
  amount: string;
  description: string;
}

interface TabButtonProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ProjectPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("PROJECT");
  const [currentMonth, setCurrentMonth] = useState<number>(2); // March (0-based)
  const [currentYear, setCurrentYear] = useState<number>(2025);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<number | string | null>(
    null
  );
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(null);

  const [monthlyChecklist, setMonthlyChecklist] =
    useState<MonthlyChecklistType>(() => {
      const daysInMonth = new Date(2025, 2 + 1, 0).getDate(); // March has 31 days
      return {
        reading: Array(daysInMonth).fill(false),
        journaling: Array(daysInMonth).fill(false),
      };
    });

  const [processTrackers, setProcessTrackers] = useState<ProcessTracker[]>([]);
  const [editingTracker, setEditingTracker] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [dailyData, setDailyData] = useState<Record<string, DayData>>({});
  const [showDatePopup, setShowDatePopup] = useState<boolean>(false);

  const [weeklyEvents, setWeeklyEvents] = useState<WeeklyEvent[]>([]);

  const [notes, setNotes] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState<NewExpense>({
    category: "",
    amount: "",
    description: "",
  });

  const [signupDate, setSignupDate] = useState(() => {
    const save = localStorage.getItem("digitalPlanner_signupDate");
    return save ? new Date(save) : new Date();
  });

  const [showHistory, setShowHistory] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  const getStorageKey = (
    type: string,
    year = currentYear,
    month = currentMonth
  ) => {
    return `digitalPlanner_${type}_${year}_${month}`;
  };

  const getYearlyNotes = () => {
    const yearlyNotes = [];

    // Get all months from January to current month (excluding current month)
    for (let month = 0; month < currentMonth; month++) {
      const savedNotes = localStorage.getItem(
        getStorageKey("notes", currentYear, month)
      );
      if (savedNotes && savedNotes.trim().length > 0) {
        yearlyNotes.push({
          month,
          notes: savedNotes,
        });
      }
    }

    return yearlyNotes.reverse(); // Most recent first
  };

  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    // Load signup date or set it if first time
    const savedSignupDate = localStorage.getItem("digitalPlanner_signupDate");
    if (!savedSignupDate) {
      const today = new Date();
      localStorage.setItem("digitalPlanner_signupDate", today.toISOString());
      setSignupDate(today);
    } else {
      setSignupDate(new Date(savedSignupDate));
    }

    // Load data for current month/year
    loadMonthData(currentYear, currentMonth);
  }, []);

  // Load data when month/year changes
  useEffect(() => {
    loadMonthData(currentYear, currentMonth);
  }, [currentMonth, currentYear]);

  const loadMonthData = (year: number, month: number) => {
    // Load projects (global, not month-specific)
    const savedProjects = localStorage.getItem("digitalPlanner_projects");
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    // Load process trackers (global)
    const savedTrackers = localStorage.getItem(
      "digitalPlanner_processTrackers"
    );
    if (savedTrackers) setProcessTrackers(JSON.parse(savedTrackers));

    // Load month-specific daily data
    const savedDailyData = localStorage.getItem(
      getStorageKey("dailyData", year, month)
    );
    if (savedDailyData) {
      setDailyData(JSON.parse(savedDailyData));
    } else {
      setDailyData({});
    }

    // Load month-specific notes
    const savedNotes = localStorage.getItem(
      getStorageKey("notes", year, month)
    );
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes("");
    }

    // Load month-specific checklist
    const savedChecklist = localStorage.getItem(
      getStorageKey("checklist", year, month)
    );
    if (savedChecklist) {
      setMonthlyChecklist(JSON.parse(savedChecklist));
    } else {
      // Reset checklist for new month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      setMonthlyChecklist({
        reading: Array(daysInMonth).fill(false),
        journaling: Array(daysInMonth).fill(false),
      });
    }

    // Load month-specific expenses
    const savedExpenses = localStorage.getItem(
      getStorageKey("expenses", year, month)
    );
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      setExpenses([]);
    }
  };

  // Save data to localStorage
  const saveToStorage = (key: any, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Save functions for different data types
  const saveProjects = (projectsData: any) => {
    localStorage.setItem(
      "digitalPlanner_projects",
      JSON.stringify(projectsData)
    );
  };

  const saveProcessTrackers = (trackersData: any) => {
    localStorage.setItem(
      "digitalPlanner_processTrackers",
      JSON.stringify(trackersData)
    );
  };

  const saveDailyData = (dailyDataObj: any) => {
    localStorage.setItem(
      getStorageKey("dailyData", currentYear, currentMonth),
      JSON.stringify(dailyDataObj)
    );
  };

  const saveNotes = (notesText: any) => {
    localStorage.setItem(
      getStorageKey("notes", currentYear, currentMonth),
      notesText
    );
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  const saveExpenses = (expensesData: any) => {
    localStorage.setItem(
      getStorageKey("expenses", currentYear, currentMonth),
      JSON.stringify(expensesData)
    );
  };

  const saveChecklist = (checklistData: any) => {
    localStorage.setItem(
      getStorageKey("checklist", currentYear, currentMonth),
      JSON.stringify(checklistData)
    );
  };

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const categories: string[] = [
    "Personal",
    "Work",
    "Travel",
    "Content",
    "Workout",
    "Meal",
  ];
  const weekDays: string[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const toggleChecklistItem = (
    type: keyof MonthlyChecklistType,
    index: number
  ) => {
    setMonthlyChecklist((prev) => ({
      ...prev,
      [type]: prev[type].map((item: boolean, i: number) =>
        i === index ? !item : item
      ),
    }));
  };

  // Updates monthly checklist when month changes ;-;
  useEffect(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    setMonthlyChecklist((prev) => ({
      reading: Array(daysInMonth)
        .fill(false)
        .map((_, i) => prev.reading[i] || false),
      journaling: Array(daysInMonth)
        .fill(false)
        .map((_, i) => prev.journaling[i] || false),
    }));
  }, [currentMonth]);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now(),
      name: "New Project",
      objective: "Define your project objective here",
      checkpoints: [
        { id: 1, text: "First checkpoint", completed: false },
        { id: 2, text: "Second checkpoint", completed: false },
        { id: 3, text: "Third checkpoint", completed: false },
      ],
      category: "Personal",
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setActiveProject(newProject.id);
  };

  const updateProject = (id: number, field: string, value: any) => {
    const updatedProjects = projects.map((project) =>
      project.id === id ? { ...project, [field]: value } : project
    );
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const updateProjectCheckpoint = (
    projectId: number,
    checkpointIndex: number,
    newText: string
  ): void => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              checkpoints: project.checkpoints.map((checkpoint, i) =>
                i === checkpointIndex
                  ? { ...checkpoint, text: newText }
                  : checkpoint
              ),
            }
          : project
      )
    );
  };

  const toggleCheckpoint = (projectId: number, checkpointIndex: number) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              checkpoints: project.checkpoints.map((checkpoint, i) =>
                i === checkpointIndex
                  ? { ...checkpoint, completed: !checkpoint.completed }
                  : checkpoint
              ),
            }
          : project
      )
    );
  };

  const deleteProject = (id: number) => {
    setProjects(projects.filter((project) => project.id !== id));
    if (activeProject === id) {
      setActiveProject(null);
    }
  };

  const addCheckpointToProject = (projectId: number) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              checkpoints: [
                ...project.checkpoints,
                { id: Date.now(), text: "New checkpoint", completed: false },
              ],
            }
          : project
      )
    );
  };

  const updateTracker = (id: number, field: string, value: any) => {
    setProcessTrackers((trackers) =>
      trackers.map((tracker) =>
        tracker.id === id ? { ...tracker, [field]: value } : tracker
      )
    );
  };

  const deleteTracker = (id: number) => {
    setProcessTrackers((trackers) =>
      trackers.filter((tracker) => tracker.id !== id)
    );
  };

  const addTracker = (): void => {
    const newTracker: ProcessTracker = {
      id: Date.now(),
      name: "New Habit",
      process: 0,
      color: "bg-gray-400",
    };
    setProcessTrackers([...processTrackers, newTracker]);
  };

  const openDatePopup = (day: number): void => {
    setSelectedDate(day);
    setShowDatePopup(true);
  };

  const getDailyKey = (date: number): string => `${currentMonth}-${date}`;

  const updateDailyTodo = (date: number, todoIndex: number, value: any) => {
    const key = getDailyKey(date);
    const updatedDailyData = {
      ...dailyData,
      [key]: {
        ...(dailyData[key] || {}),
        todos:
          dailyData[key]?.todos?.map((todo, i) =>
            i === todoIndex ? { ...todo, ...value } : todo
          ) || [],
      },
    };
    setDailyData(updatedDailyData);
    saveDailyData(updatedDailyData);
  };

  const addDailyTodo = (date: number) => {
    const key = getDailyKey(date);
    const newTodo = { id: Date.now(), text: "New task", completed: false };
    setDailyData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}), // ✅ safe default
        todos: [...(prev[key]?.todos || []), newTodo],
      },
    }));
  };

  const toggleHabitForDate = (date: number, habitId: number) => {
    const key = getDailyKey(date);
    setDailyData((prev) => {
      const currentHabits = prev[key]?.habits || {};
      const newHabits = {
        ...currentHabits,
        [habitId]: !currentHabits[habitId],
      };

      // Calculate new percentage for this habit
      const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();
      const completedDays =
        Object.keys(prev).filter((dateKey) => {
          const [month] = dateKey.split("-").map(Number);
          return month === currentMonth && prev[dateKey]?.habits?.[habitId];
        }).length +
        (newHabits[habitId] ? 1 : 0) -
        (currentHabits[habitId] ? 1 : 0);

      const currentDay = Math.min(new Date().getDate(), daysInMonth);
      const percentage = Math.round((completedDays / currentDay) * 100);

      // Update the tracker percentage
      setProcessTrackers((trackers) =>
        trackers.map((tracker) =>
          tracker.id === habitId ? { ...tracker, process: percentage } : tracker
        )
      );

      return {
        ...prev,
        [key]: {
          ...prev[key],
          habits: newHabits,
        },
      };
    });
  };

  const addExpense = () => {
    if (newExpense.category && newExpense.amount && newExpense.description) {
      const expense = {
        id: Date.now(),
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
      };
      const updatedExpenses = [...expenses, expense];
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      setNewExpense({ category: "", amount: "", description: "" });
    }
  };

  const updateExpense = (
    id: number,
    updatedExpense: Partial<Expense>
  ): void => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      )
    );
    setEditingExpense(null);
  };

  const deleteExpense = (id: number): void => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const renderCalendarGrid = () => {
    const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();
    const firstDay = new Date(2025, currentMonth, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = weeklyEvents.some((event) => event.day === day);
      const dailyKey = getDailyKey(day);
      const dayData = dailyData[dailyKey];
      const hasTodos = dayData?.todos?.length && dayData.todos.length > 0;
      const completedTodos =
        dayData?.todos?.filter((todo) => todo.completed).length || 0;
      const totalTodos = dayData?.todos?.length || 0;

      // Check if all habits are completed
      const completedHabits = processTrackers.filter(
        (habit) => dayData?.habits?.[habit.id]
      ).length;
      const totalHabits = processTrackers.length;

      // Check if everything is completed (all todos + all habits)
      const allTodosCompleted =
        totalTodos > 0 ? completedTodos === totalTodos : true;
      const allHabitsCompleted =
        totalHabits > 0 ? completedHabits === totalHabits : true;
      const dayFullyCompleted =
        allTodosCompleted &&
        allHabitsCompleted &&
        (totalTodos > 0 || totalHabits > 0);

      let dayClasses =
        "calendar-day h-14 border p-1 relative rounded cursor-pointer transition-all duration-300 text-xs bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-300";

      if (dayFullyCompleted) {
        dayClasses += " completed bg-green-50 border-green-500 text-green-800";
      }

      if (hasTodos) {
        dayClasses += " has-todos";
      }

      if (completedHabits > 0) {
        dayClasses += " has-habits";
      }

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => openDatePopup(day)}
        >
          <div className="text-xs font-medium transition-all duration-300">
            {day}
          </div>
          {hasTodos && (
            <div
              className={`absolute top-0 right-0 text-xs rounded-full w-4 h-4 flex items-center justify-center transition-all duration-300 ${
                completedTodos === totalTodos
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
              style={{ fontSize: "8px" }}
            >
              {completedTodos}/{totalTodos}
            </div>
          )}
          {completedHabits > 0 && (
            <div
              className={`absolute bottom-0 right-0 text-xs rounded-full w-4 h-4 flex items-center justify-center transition-all duration-300 ${
                completedHabits === totalHabits
                  ? "bg-purple-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
              style={{ fontSize: "8px" }}
            >
              {completedHabits}/{totalHabits}
            </div>
          )}
          {hasEvent && (
            <div className="absolute bottom-1 left-1 right-1">
              {weeklyEvents
                .filter((event) => event.day === day)
                .map((event, i) => (
                  <div
                    key={i}
                    className={`text-xs p-1 rounded ${event.color} truncate`}
                  >
                    {event.title}
                  </div>
                ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Add these state variables
  const [showNotesArchive, setShowNotesArchive] = useState(false);
  const [showJournalArchive, setShowJournalArchive] = useState(false);
  const [selectedNotebook, setSelectedNotebook] =
    useState<NotesArchiveData | null>(null);
  const [selectedJournalMonth, setSelectedJournalMonth] =
    useState<JournalArchiveData | null>(null);
  const [selectedJournalWeek, setSelectedJournalWeek] = useState<{
    week: JournalDay[];
    weekIndex: number;
  } | null>(null);
  const [notesArchiveData, setNotesArchiveData] = useState<NotesArchiveData[]>(
    []
  );
  const [journalArchiveData, setJournalArchiveData] = useState<
    JournalArchiveData[]
  >([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load Notes Archive Data
  const loadNotesArchive = () => {
    const notesData = months.map((monthName, monthIndex) => {
      const notes =
        localStorage.getItem(getStorageKey("notes", currentYear, monthIndex)) ||
        "";
      return {
        month: monthIndex,
        monthName,
        year: currentYear,
        notes,
        hasContent: notes.trim().length > 0,
      };
    });

    setNotesArchiveData(notesData);
    setShowNotesArchive(true);
  };

  //player stuff

  // Load Journal Archive Data
  const loadJournalArchive = () => {
    const journalData = months.map((monthName, monthIndex) => {
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      const weeks = [];

      // Group days into weeks
      let currentWeek = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dailyKey = `${monthIndex}-${day}`;
        const monthlyDailyData = JSON.parse(
          localStorage.getItem(
            getStorageKey("dailyData", currentYear, monthIndex)
          ) || "{}"
        );
        const dayData = JSON.parse(
          localStorage.getItem(
            `digitalPlanner_journal_${currentYear}_${monthIndex}_${day}`
          ) || "{}"
        );

        currentWeek.push({
          day,
          date: new Date(currentYear, monthIndex, day),
          content: dayData.journalContent || "",
          mood: dayData.mood || "",
          energy: dayData.energy || 5,
          weather: dayData.weather || "",
          hasContent: (dayData.content || "").trim().length > 0,
        });

        if (currentWeek.length === 7 || day === daysInMonth) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }

      return {
        month: monthIndex,
        monthName,
        year: currentYear,
        weeks,
        hasContent: weeks.some((week) => week.some((day) => day.hasContent)),
      };
    });

    setJournalArchiveData(journalData);
    setShowJournalArchive(true);
  };

  const loadHistoricalData = () => {
    const months = getStoredMonths();
    const history: HistoricalData[] = months
      .map(({ year, month }) => {
        const notes =
          localStorage.getItem(getStorageKey("notes", year, month)) || "";
        const expensesData = localStorage.getItem(
          getStorageKey("expenses", year, month)
        );
        const expenses: Expense[] = expensesData
          ? JSON.parse(expensesData)
          : [];

        return {
          year,
          month,
          notes,
          expenses,
          totalExpenses: expenses.reduce(
            (sum: number, exp: Expense) => sum + exp.amount,
            0
          ),
        };
      })
      .reverse();

    setHistoricalData(history);
    setShowHistory(true);
  };

  // Helper function to get all stored months since signup
  const getStoredMonths = () => {
    const months = [];
    const signup = new Date(signupDate);
    const current = new Date(currentYear, currentMonth);

    let date = new Date(signup.getFullYear(), signup.getMonth());
    while (date <= current) {
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
      });
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  const TabButton: React.FC<TabButtonProps> = ({
    id,
    icon: Icon,
    label,
    isActive,
    onClick,
  }) => (
    <button
      onClick={onClick}
      className={`tab-button flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive ? "active" : ""
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768); // 768px = md in Tailwind
    checkScreen(); // Run once at mount
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-light transition-all duration-500 overflow-x-hidden">
      {/* Header */}
      <div className="full-width-header header-gradient-light">
        <div className="px-6 flex items-center justify-between mb-4">
          <div className="flex items-center justify-between gap-4 px-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold transition-all duration-300 text-white">
              Digital Planner
            </h1>
          </div>

          <div className="flex items-center gap-4 px-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {/* Using JS cause i cant with tailwind >:(*/}
              {isMobile ? (
                // Mobile dropdown
                <select
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 min-w-[120px]"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              ) : (
                // Desktop buttons
                <div className="flex gap-2">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => setCurrentMonth(index)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 border-transparent ${
                        currentMonth === index
                          ? "bg-white text-gray"
                          : "bg-opacity-90 backdrop-blur-md text-white"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={loadHistoricalData}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-transparent hover:bg-white/30 
               text-white text-sm font-medium rounded-lg transition-all duration-300
               flex items-center gap-2 border-transparent bg-opacity-90"
            >
              <BookOpen className="w-4 h-4" />
              <span className="sm:hidden sm:inline">History</span>
            </button>
          </div>
        </div>

        {/*Beginning of Tabs*/}
        <div className="flex gap-2 px-3">
          <TabButton
            id="PROJECT"
            icon={Target}
            label="PROJECT"
            isActive={activeTab === "PROJECT"}
            onClick={() => setActiveTab("PROJECT")}
          />
          <TabButton
            id="TRACKER"
            icon={CheckSquare}
            label="TRACKER"
            isActive={activeTab === "TRACKER"}
            onClick={() => setActiveTab("TRACKER")}
          />
          <TabButton
            id="EXPENSE"
            icon={DollarSign}
            label="EXPENSE"
            isActive={activeTab === "EXPENSE"}
            onClick={() => setActiveTab("EXPENSE")}
          />
        </div>
      </div>

      {/*End of tabs*/}

      {/*Beginning of description of tabs*/}
      <div className="p-6">
        {activeTab === "PROJECT" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 space-y-6">
              <div className="card-hover bg-white rounded-xl shadow-lg p-6 border-control ">
                <div className="flex items-center justify-between mb-6 ">
                  <h2 className="text-base  text-gray-800 ">Projects</h2>
                  <button
                    onClick={addProject}
                    className="bg-purple-500 text-white p-1 sm:p-2 rounded-lg hover:bg-purple-500 text-xs sm:text-sm border-transparent overflow-hidden"
                  >
                    <Plus className="w-4 h-4 sm:" />
                  </button>
                </div>

                {/* Project Tabs */}
                <div className="space-y-2 mb-6">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() =>
                        setActiveProject(
                          activeProject === project.id ? null : project.id
                        )
                      }
                      className="w-full text-left p-3 rounded-lg border transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingProject === project.id ? (
                            <input
                              type="text"
                              defaultValue={project.name}
                              onBlur={(
                                e: React.FocusEvent<HTMLInputElement>
                              ) => {
                                updateProject(
                                  project.id,
                                  "name",
                                  e.target.value
                                );
                                setEditingProject(null);
                              }}
                              onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                              }
                              className="w-full px-2 py-1 border border-purple-300 rounded bg-white"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-gray-800">
                              {project.name}
                            </span>
                          )}
                          <div className="text-sm text-gray-600 mt-1">
                            {
                              project.checkpoints.filter((cp) => cp.completed)
                                .length
                            }
                            /{project.checkpoints.length} completed •{" "}
                            {project.category}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project.id);
                            }}
                            className="text-purple-600 hover:text-purple-800 p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Project Details */}
                {activeProject ? (
                  <div className="bg-purple-50 rounded-lg p-4 overflow-hidden">
                    {(() => {
                      const project = projects.find(
                        (p) => p.id === activeProject
                      );
                      if (!project) return null;

                      return (
                        <>
                          <div className="mb-4" style={{ width: "100%" }}>
                            <h3 className="text-purple-800 mb-2 text-sm">
                              PROJECT OBJECTIVE
                            </h3>
                            {editingProject === `${project.id}-objective` ? (
                              <div
                                style={{ width: "100%", position: "relative" }}
                              >
                                <textarea
                                  defaultValue={project.objective}
                                  onBlur={(
                                    e: React.FocusEvent<HTMLTextAreaElement>
                                  ) => {
                                    updateProject(
                                      project.id,
                                      "objective",
                                      e.target.value
                                    );
                                    setEditingProject(null);
                                  }}
                                  style={{
                                    width: "100%",
                                    maxWidth: "100%",
                                    minWidth: "0",
                                    boxSizing: "border-box",
                                    resize: "none",
                                    padding: "8px",
                                    border: "1px solid #a855f7",
                                    borderRadius: "4px",
                                    backgroundColor: "white",
                                    fontSize: "14px",
                                  }}
                                  rows={3}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <p
                                className="text-gray-700 cursor-pointer hover:bg-purple-100 rounded text-sm p-2"
                                onClick={() =>
                                  setEditingProject(`${project.id}-objective`)
                                }
                                style={{
                                  width: "100%",
                                  maxWidth: "100%",
                                  wordWrap: "break-word",
                                  overflowWrap: "break-word",
                                }}
                              >
                                {project.objective}
                              </p>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-blue-600 text-sm">
                                CHECKPOINTS
                              </h4>
                              <button
                                onClick={() =>
                                  addCheckpointToProject(project.id)
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {project.checkpoints.map((checkpoint, i) => (
                                <div
                                  key={checkpoint.id}
                                  className="flex items-center gap-2"
                                >
                                  <button
                                    onClick={() =>
                                      toggleCheckpoint(project.id, i)
                                    }
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                      checkpoint.completed
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "border-gray-300 hover:border-green-400"
                                    }`}
                                  >
                                    {checkpoint.completed && (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </button>
                                  {editingAction === `${project.id}-${i}` ? (
                                    <input
                                      type="text"
                                      defaultValue={checkpoint.text}
                                      onBlur={(e) => {
                                        updateProjectCheckpoint(
                                          project.id,
                                          i,
                                          e.target.value
                                        );
                                        setEditingAction(null);
                                      }}
                                      className="flex-1 text-sm text-gray-700 border border-blue-300 rounded px-2 py-1"
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className={`flex-1 text-sm cursor-pointer hover:bg-blue-100 px-2 py-1 rounded ${
                                        checkpoint.completed
                                          ? "line-through text-gray-500"
                                          : "text-gray-700"
                                      }`}
                                      onClick={() =>
                                        setEditingAction(`${project.id}-${i}`)
                                      }
                                    >
                                      {checkpoint.text}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-600">
                              Category:
                            </label>
                            <select
                              value={project.category}
                              onChange={(e) =>
                                updateProject(
                                  project.id,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : projects.length > 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Click on a project above to view details</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>
                      No projects yet. Click the + button to create your first
                      project!
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg mt-6">
                <SpotifyPlayer />
              </div>
            </div>

            {/* Calendar Section */}
            <div className="col-span-5">
              <div className="card-hover bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-7  mb-4">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className=" text-sm font-medium text-gray-600 "
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="xs:hidden">{day.charAt(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="calendar-grid grid grid-cols-7 gap-2">
                  {renderCalendarGrid()}
                </div>
              </div>
            </div>

            {/* Process Tracker & Notes */}
            <div className="col-span-3 space-y-6">
              <div className="card-hover bg-white rounded-xl shadow-lg p-6 border-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className=" text-sm text-gray-800">Habit Tracker</h3>
                  <button
                    onClick={() => addTracker()}
                    className="bg-green-500 text-white p-1 sm:p-1.0 md:p-2. rounded sm:rounded-lg text-xs hover:bg-green-700 border-transparent"
                  >
                    <Plus className="w-3 h-2 sm:w-4 sm:h-5" />
                    Add Habit
                  </button>
                </div>
                <div className="space-y-4">
                  {processTrackers.map((tracker) => (
                    <div key={tracker.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {editingTracker === tracker.id ? (
                            <input
                              type="text"
                              defaultValue={tracker.name}
                              onBlur={(e) => {
                                updateTracker(
                                  tracker.id,
                                  "name",
                                  e.target.value
                                );
                                setEditingTracker(null);
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="flex-1 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                              onClick={() => setEditingTracker(tracker.id)}
                            >
                              {tracker.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {tracker.process}%
                          </span>
                          <button
                            onClick={() => deleteTracker(tracker.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`progress-bar h-2 rounded-full ${tracker.color} transition-all duration-300`}
                          style={{ width: `${tracker.process}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        Automatically calculated from daily completions
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-hover bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between mb overflow-hidden">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4" />
                    NOTES
                  </h3>
                  <button
                    onClick={loadNotesArchive}
                    className="text-xs px-1 py-1 rounded text-yellow-800 transition-all duration-300 bg-white border-transparent ml- sm:ml-6 md:ml-8"
                  >
                    View Archive
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="w-full h-32 bg-transparent resize-none border-none outline-none text-gray-700 handwriting text-sm"
                  placeholder="Write your thoughts about the month here..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "TRACKER" && (
          <div className="grid grid-cols-2 gap-6 overflow-hidden">
            <div className="card-hover rounded-xl shadow-lg p-6 transition-all duration-500 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm transition-all duration-300">
                  Habit Tracking
                </h2>
                <button
                  onClick={() => addTracker()}
                  className=" text-xs px-3 py-1 rounded  transition-all duration-300 bg-gradient-light border-transparent ml-4 sm:ml-6 md:ml-8"
                >
                  + Add Habit
                </button>
              </div>
              <div className="space-y-6">
                {processTrackers.map((tracker) => (
                  <div
                    key={tracker.id}
                    className="p-4 rounded-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {editingTracker === tracker.id ? (
                          <input
                            type="text"
                            defaultValue={tracker.name}
                            onBlur={(e) => {
                              updateTracker(tracker.id, "name", e.target.value);
                              setEditingTracker(null);
                            }}
                            className="flex-1 px-3 py-2 border rounded transition-all duration-300"
                            autoFocus
                          />
                        ) : (
                          <h3
                            className="flex-1 font-semibold cursor-pointer px-3 py-2 rounded transition-all duration-300"
                            onClick={() => setEditingTracker(tracker.id)}
                          >
                            {tracker.name}
                          </h3>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold transition-all duration-300">
                          {tracker.process}%
                        </span>
                        <button
                          onClick={() => deleteTracker(tracker.id)}
                          className="p-1 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-4 mb-3 transition-all duration-300">
                      <div
                        className="progress-bar h-4 rounded-full transition-all duration-300"
                        style={{ width: `${tracker.process}%` }}
                      ></div>
                    </div>
                    <div className="text-sm p-3 rounded transition-all duration-300">
                      <p className="mb-1">
                        <strong>Daily Habit:</strong> Complete in calendar daily
                        view
                      </p>
                      <p>
                        Progress updates automatically based on daily
                        completions this month
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-hover rounded-xl shadow-lg p-6 transition-all duration-500 bg-white overflow-hidden ">
              <h2 className="font-bold mb-6 transition-all duration-300 overflow-hidden md:text-xs text-sm sm:text-base md:text-lg lg:text-xl">
                Monthly Habit Overview
              </h2>
              <div className="space-y-6">
                {processTrackers.map((habit) => {
                  const daysInMonth = new Date(
                    currentYear,
                    currentMonth + 1,
                    0
                  ).getDate();
                  return (
                    <div
                      key={habit.id}
                      className="p-4 bg-gray-50 rounded-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold transition-all duration-300">
                          {habit.name}
                        </h3>
                        <span className="text-sm text-gray-500 font-medium">
                          {habit.process}% completed
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const dailyKey = `${currentMonth}-${day}`;
                          const isCompleted =
                            dailyData[dailyKey]?.habits?.[habit.id] || false;
                          const isToday =
                            day === new Date().getDate() &&
                            currentMonth === new Date().getMonth() &&
                            currentYear === new Date().getFullYear();

                          return (
                            <button
                              key={i}
                              onClick={() => toggleHabitForDate(day, habit.id)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-300 border-2 ${
                                isCompleted
                                  ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                                  : isToday
                                  ? "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {processTrackers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-base">
                    <CheckSquare className="w-11 h-11 text-sm mx-auto mb-4 text-gray-300" />
                    <p>
                      No habits to track yet. Add habits in the left panel to
                      see your monthly overview here!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "EXPENSE" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  Expense Tracker
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      ${expenses.reduce((sum, exp) => sum + exp.amount, 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      This Month
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Expense */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Add New Expense</h3>
                <button
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="sm:hidden bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium border-transparent"
                >
                  {showExpenseForm ? "Cancel" : "Add New"}
                </button>
              </div>

              {/* Form - Hidden on mobile by default */}
              <div
                className={`${
                  showExpenseForm ? "block" : "hidden"
                } sm:block transition-all duration-300`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Category (e.g. Food, Gas)"
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                    className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addExpense}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Expenses List & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Expenses List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Recent Expenses
                  </h3>

                  {expenses.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-10 h-10 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-2 text-sm">
                        No expenses recorded yet
                      </p>
                      <p className="text-sm text-gray-400">
                        Add your first expense to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                        >
                          {editingExpense === expense.id ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              <input
                                type="text"
                                defaultValue={expense.category}
                                onBlur={(e) =>
                                  updateExpense(expense.id, {
                                    category: e.target.value,
                                  })
                                }
                                className="px-5 py-1.5 border rounded text-sm mb-5"
                                autoFocus
                              />
                              <input
                                type="number"
                                defaultValue={expense.amount}
                                onBlur={(e) =>
                                  updateExpense(expense.id, {
                                    amount: parseFloat(e.target.value),
                                  })
                                }
                                className="px-5 py-1.5 border rounded text-sm"
                              />
                              <input
                                type="text"
                                defaultValue={expense.description}
                                onBlur={(e) =>
                                  updateExpense(expense.id, {
                                    description: e.target.value,
                                  })
                                }
                                className="px-2 py-1.5 border rounded text-sm"
                              />
                              <button
                                onClick={() => setEditingExpense(null)}
                                className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-1">
                                  <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 text-base font-medium rounded-full">
                                    {expense.category}
                                  </span>
                                  <span className="font-bold text-lg text-gray-900">
                                    ${expense.amount}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm p-4">
                                  {expense.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingExpense(expense.id)}
                                  className="p-2 bg-blue-100 rounded-lg transition-all duration-300 border-transparent"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteExpense(expense.id)}
                                  className="p-2 bg-red-100 rounded-lg transition-all duration-300 border-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-4 sm:p-6 border border-green-100 bg-white">
                  <h3 className="font-bold text-green-800 mb-4">
                    Monthly Summary
                  </h3>

                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      ${expenses.reduce((sum, exp) => sum + exp.amount, 0)}
                    </div>
                    <div className="text-sm text-green-600">
                      {expenses.length} expense
                      {expenses.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {expenses.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 text-sm">
                        By Category
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          const categoryTotals = expenses.reduce(
                            (acc: Record<string, number>, exp) => {
                              acc[exp.category] =
                                (acc[exp.category] || 0) + exp.amount;
                              return acc;
                            },
                            {}
                          );

                          return Object.entries(categoryTotals)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, total]) => (
                              <div
                                key={category}
                                className="flex justify-between items-center py-1"
                              >
                                <span className="text-green-700 text-sm truncate pr-2">
                                  {category}
                                </span>
                                <span className="font-semibold text-green-800 text-sm">
                                  ${total}
                                </span>
                              </div>
                            ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Popup Modal */}
      {showDatePopup && selectedDate && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="bounce-in bg-white rounded-xl shadow-2xl p-6 w-96 max-h-96 overflow-y-auto transition-all duration-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold transition-all duration-300">
                {months[currentMonth]} {selectedDate}, 2025
              </h3>
              <button
                onClick={() => setShowDatePopup(false)}
                className="transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Habit Tracker for the day */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 transition-all duration-300">
                Daily Habits
              </h4>
              <div className="space-y-2">
                {processTrackers.map((habit) => {
                  const dailyKey = getDailyKey(selectedDate);
                  const isCompleted =
                    dailyData[dailyKey]?.habits?.[habit.id] || false;
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 p-2 rounded transition-all duration-300"
                    >
                      <button
                        onClick={() =>
                          toggleHabitForDate(selectedDate, habit.id)
                        }
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                      >
                        {isCompleted && <Check className="w-4 h-4" />}
                      </button>
                      <span className="flex-1 text-sm font-medium transition-all duration-300">
                        {habit.name}
                      </span>
                      <span className="text-xs px-2 py-1 rounded transition-all duration-300">
                        {isCompleted ? "Done" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Todos */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold transition-all duration-300">
                  Daily Tasks
                </h4>
                <button
                  onClick={() => addDailyTodo(selectedDate)}
                  className="px-3 py-1 rounded text-sm transition-all duration-300 "
                >
                  + Add Task
                </button>
              </div>
              <div className="space-y-2">
                {(dailyData[getDailyKey(selectedDate)]?.todos || []).map(
                  (todo, index) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-2 p-2 rounded transition-all duration-300"
                    >
                      <button
                        onClick={() =>
                          updateDailyTodo(selectedDate, index, {
                            completed: !todo.completed,
                          })
                        }
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300"
                      >
                        {todo.completed && <Check className="w-3 h-3" />}
                      </button>
                      <input
                        type="text"
                        value={todo.text}
                        onChange={(e) =>
                          updateDailyTodo(selectedDate, index, {
                            text: e.target.value,
                          })
                        }
                        className="flex-1 bg-transparent border-none outline-none text-sm transition-all duration-300"
                        placeholder="Enter task..."
                      />
                    </div>
                  )
                )}
                {(dailyData[getDailyKey(selectedDate)]?.todos || []).length ===
                  0 && (
                  <p className="text-sm text-center py-4 transition-all duration-300">
                    No tasks for this day. Click "Add Task" to get started!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotesArchive && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[75vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Notes Archive
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowNotesArchive(false);
                  setSelectedNotebook(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-all duration-300 p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedNotebook ? (
                // Month Selector View
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Month
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onChange={(e) => {
                        if (e.target.value) {
                          const monthIndex = parseInt(e.target.value);
                          const monthNames = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ];

                          const monthData = notesArchiveData.find(
                            (d) => d.month === monthIndex
                          ) || {
                            month: monthIndex,
                            monthName: monthNames[monthIndex],
                            year: currentYear,
                            hasContent: false,
                            notes: "",
                          };

                          setSelectedNotebook(monthData);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Choose a month...</option>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((name, i) => {
                        const monthData = notesArchiveData.find(
                          (d) => d.month === i
                        );
                        return (
                          <option key={i} value={i}>
                            {name} {currentYear}{" "}
                            {monthData?.hasContent ? "📝" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Preview of months with content */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-800 mb-3">
                      Months with Notes
                    </h3>
                    <div className="space-y-2">
                      {notesArchiveData.filter((d) => d.hasContent).length >
                      0 ? (
                        notesArchiveData
                          .filter((d) => d.hasContent)
                          .map((monthData) => (
                            <button
                              key={monthData.month}
                              onClick={() => setSelectedNotebook(monthData)}
                              className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-purple-100 transition-colors text-sm"
                            >
                              <span className="font-medium">
                                {monthData.monthName}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {monthData.year}
                              </span>
                            </button>
                          ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No notes yet this year
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Individual Notebook View
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setSelectedNotebook(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 transition-colors"
                    >
                      <span>←</span> Back
                    </button>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      <h3 className="text-base font-medium text-gray-800">
                        {selectedNotebook.monthName} {selectedNotebook.year}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 flex-1 overflow-y-auto">
                    {selectedNotebook.hasContent ? (
                      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedNotebook.notes}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
                        <BookOpen className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm font-medium">No notes yet</p>
                        <p className="text-xs mt-1">
                          Nothing written for this month
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historical Data Modal */}
      {showHistory && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-6xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Historical Data
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historicalData.map(
                  ({ year, month, notes, expenses, totalExpenses }) => (
                    <div
                      key={`${year}-${month}`}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-purple-800">
                          {months[month]} {year}
                        </h3>
                        <button
                          onClick={() => {
                            setCurrentMonth(month);
                            setCurrentYear(year);
                            setShowHistory(false);
                          }}
                          className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          View
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white/60 rounded p-3">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">
                            Expenses
                          </h4>
                          <div className="text-sm text-gray-600">
                            <div>Items: {expenses.length}</div>
                            <div className="font-bold">
                              ${totalExpenses.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {notes && (
                          <div className="bg-white/60 rounded p-3">
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">
                              Notes
                            </h4>
                            <div className="text-xs text-gray-600 max-h-16 overflow-hidden">
                              {notes.length > 100
                                ? notes.substring(0, 100) + "..."
                                : notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {historicalData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    No historical data found. Start using the planner to build
                    your history!
                  </p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {historicalData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">
                  Overall Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {historicalData.length}
                    </div>
                    <div className="text-sm text-gray-600">Months Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {historicalData.reduce(
                        (sum, month) => sum + month.expenses.length,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Expense Items
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      $
                      {historicalData
                        .reduce((sum, month) => sum + month.totalExpenses, 0)
                        .toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPlanner;
