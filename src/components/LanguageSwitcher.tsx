import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import authService from "@/services/authService";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = async (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);

        // If user is logged in, sync to profile
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await authService.updateProfile({ language: lng });

                // Update local storage user object if exists
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.language = lng;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (error) {
                console.error("Failed to sync language to profile:", error);
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('uz')}>
                    <span className="mr-2">🇺🇿</span> O'zbekcha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ru')}>
                    <span className="mr-2">🇷🇺</span> Русский
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
