import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const TeacherMessagesPage = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('teacherMessages.title')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('teacherMessages.history')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="text-lg font-medium mb-1">{t('teacherMessages.empty.title')}</h3>
                        <p className="text-muted-foreground">{t('teacherMessages.empty.description')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TeacherMessagesPage;
