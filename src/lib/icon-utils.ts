
import * as LucideIcons from "lucide-react";

export const getLucideIcon = (name: string): LucideIcons.LucideIcon => {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) {
        console.warn(`Icon "${name}" not found in lucide-react. Falling back to HelpCircle.`);
        return LucideIcons.HelpCircle;
    }
    return Icon;
};
