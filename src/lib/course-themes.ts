export const getSubjectTheme = (subjectName: any = "") => {
    const s = String(subjectName || "").toLowerCase();

    // Theme mapping
    if (s.includes("matematika") || s.includes("math")) {
        return {
            bg: "from-blue-600 to-indigo-700",
            light: "bg-blue-50 dark:bg-blue-900/20",
            text: "text-blue-600 dark:text-blue-400",
            icon: "Calculator",
            fallbackImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800" // Calculus/Math
        };
    }
    if (s.includes("fizika") || s.includes("physics")) {
        return {
            bg: "from-purple-600 to-violet-800",
            light: "bg-purple-50 dark:bg-purple-900/20",
            text: "text-purple-600 dark:text-purple-400",
            icon: "Atom",
            fallbackImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800" // Physics/Atom
        };
    }
    if (s.includes("informatika") || s.includes("dasturlash") || s.includes("it") || s.includes("informatics") || s.includes("python")) {
        return {
            bg: "from-emerald-600 to-teal-800",
            light: "bg-emerald-50 dark:bg-emerald-900/20",
            text: "text-emerald-600 dark:text-emerald-400",
            icon: "Code2",
            fallbackImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800" // Coding
        };
    }
    if (s.includes("ingliz") || s.includes("english")) {
        return {
            bg: "from-orange-600 to-red-700",
            light: "bg-orange-50 dark:bg-orange-900/20",
            text: "text-orange-600 dark:text-orange-400",
            icon: "Languages",
            fallbackImage: "https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&q=80&w=800" // London/English
        };
    }
    if (s.includes("kimyo") || s.includes("chemistry")) {
        return {
            bg: "from-teal-500 to-cyan-700",
            light: "bg-teal-50 dark:bg-teal-900/20",
            text: "text-teal-600 dark:text-teal-400",
            icon: "FlaskConical",
            fallbackImage: "https://images.unsplash.com/photo-1532187863486-abf9bdad1b69?auto=format&fit=crop&q=80&w=800" // Chemistry
        };
    }
    if (s.includes("biologiya") || s.includes("biology")) {
        return {
            bg: "from-green-600 to-emerald-800",
            light: "bg-green-50 dark:bg-green-900/20",
            text: "text-green-600 dark:text-green-400",
            icon: "Dna",
            fallbackImage: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800" // Biology/Microscope
        };
    }
    if (s.includes("mantiq") || s.includes("logic")) {
        return {
            bg: "from-amber-500 to-orange-700",
            light: "bg-amber-50 dark:bg-amber-900/20",
            text: "text-amber-600 dark:text-amber-400",
            icon: "Brain",
            fallbackImage: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800" // Brain/Logic
        };
    }

    // Default
    return {
        bg: "from-slate-600 to-slate-800",
        light: "bg-slate-50 dark:bg-slate-900/20",
        text: "text-slate-600",
        icon: "BookOpen",
        fallbackImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800" // Library
    };
};
