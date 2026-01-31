import { 
    LayoutDashboard, 
    User, 
    Code2, 
    Trophy, 
    History, 
    BarChart, 
    GitCompare, 
    Bookmark, 
    FileText, 
    Target 
} from "lucide-react";

export const navItems = [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { title: "Profile", href: "/profile", icon: User },
    { title: "Problems", href: "/problems", icon: Code2 },
    { title: "Contests", href: "/contests", icon: Trophy },
    { title: "Submissions", href: "/submissions", icon: History },
    { title: "Goals", href: "/goals", icon: Target },
    { title: "Analytics", href: "/analytics", icon: BarChart },
    { title: "Compare", href: "/compare", icon: GitCompare },
    { title: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { title: "Notes", href: "/notes", icon: FileText },
];
