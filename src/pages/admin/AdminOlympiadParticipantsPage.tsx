
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, Trophy, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

interface Participant {
    id: number;
    rank: number;
    name: string;
    region: string;
    score: number;
    max_score: number;
    time: string;
    avatar?: string;
    status: string; // "COMPLETED" | "DISQUALIFIED" | "STARTED"
}

const AdminOlympiadParticipantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [olympiadTitle, setOlympiadTitle] = useState("");

    useEffect(() => {
        fetchParticipants();
    }, [id]);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            // First fetch Olympiad details for title
            const olyRes = await axios.get(`${API_URL}/olympiads/${id}/`, { headers: getAuthHeader() });
            setOlympiadTitle(olyRes.data.title);

            // Then fetch leaderboard/participants
            // Assuming /leaderboard/ gives us the list. If not, we might need a specific admin Participants endpoint.
            const res = await axios.get(`${API_URL}/olympiads/${id}/leaderboard/`, { headers: getAuthHeader() });

            if (res.data && res.data.participants) {
                setParticipants(res.data.participants);
            } else if (Array.isArray(res.data)) {
                setParticipants(res.data);
            } else {
                setParticipants([]);
            }

        } catch (error) {
            console.error(error);
            toast.error(t('admin.loadParticipantsError'));
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.region && p.region.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate("/admin/olympiads")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{t('admin.participants')}</h1>
                    <p className="text-muted-foreground">{olympiadTitle}</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t('admin.allParticipants')}</CardTitle>
                        <CardDescription>{t('admin.participantsCountLabel', { count: participants.length })}</CardDescription>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> {t('admin.export')}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('admin.participantSearchPlaceholder')}
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">{t('admin.rank')}</TableHead>
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead>{t('admin.region')}</TableHead>
                                    <TableHead>{t('admin.score')}</TableHead>
                                    <TableHead>{t('admin.time')}</TableHead>
                                    <TableHead>{t('admin.status')}</TableHead>
                                    <TableHead className="w-[50px]">{t('common.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">{t('common.loading')}</TableCell>
                                    </TableRow>
                                ) : filteredParticipants.length > 0 ? (
                                    filteredParticipants.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-bold">#{p.rank}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {p.avatar && <img src={p.avatar} className="w-6 h-6 rounded-full" />}
                                                    {p.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{p.region || "-"}</TableCell>
                                            <TableCell>
                                                <span className="font-bold">{p.score}</span> / {p.max_score}
                                            </TableCell>
                                            <TableCell>{p.time}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'DISQUALIFIED' ? 'bg-red-100 text-red-700' :
                                                    'bg-green-100 text-green-700'
                                                    }`}>
                                                    {p.status === 'DISQUALIFIED' ? t('admin.disqualification') :
                                                        p.status === 'STARTED' ? t('admin.upcoming') :
                                                            t('admin.completed')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/admin/olympiads/${id}/participants/${p.id}/analysis`)}
                                                    className="hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            {t('admin.participantsNotFound')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOlympiadParticipantsPage;
