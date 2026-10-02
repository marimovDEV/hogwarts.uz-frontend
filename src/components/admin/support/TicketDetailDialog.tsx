import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Send, Clock, AlertTriangle, Shield, StickyNote } from "lucide-react";

interface TicketDetailDialogProps {
    ticket: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (status: string) => void;
    onReply: (message: string, isInternal: boolean) => void;
}

const TicketDetailDialog = ({ ticket, isOpen, onClose, onStatusChange, onReply }: TicketDetailDialogProps) => {
    const { t } = useTranslation();
    const [replyMessage, setReplyMessage] = useState("");
    const [internalNote, setInternalNote] = useState("");
    const [isInternal, setIsInternal] = useState(false);

    const getPriorityLocal = (p: string) => {
        switch (p) {
            case 'HIGH': return t('admin.priorityHigh');
            case 'MEDIUM': return t('admin.priorityMedium');
            case 'LOW': return t('admin.priorityLow');
            default: return p;
        }
    };

    if (!ticket) return null;

    const handleSend = () => {
        if (isInternal) {
            if (!internalNote.trim()) return;
            onReply(internalNote, true);
            setInternalNote("");
        } else {
            if (!replyMessage.trim()) return;
            onReply(replyMessage, false);
            setReplyMessage("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden bg-gray-50/50 dark:bg-gray-950">
                {/* Header */}
                <div className="bg-white dark:bg-gray-950 px-6 py-4 border-b dark:border-gray-800 flex justify-between items-start">
                    <div>
                        <DialogTitle className="flex items-center gap-3 text-xl dark:text-gray-100">
                            {t('admin.supportSection.ticket')} #{ticket.ticket_number} - {t(ticket.subject as any)}
                            <Badge className={`${ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} border-0`}>
                                {getPriorityLocal(ticket.priority)}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="mt-1 flex items-center gap-2 dark:text-gray-400">
                            <User className="w-4 h-4" /> {ticket.user.full_name || ticket.user.username} ({ticket.user.email})
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4" /> {new Date(ticket.created_at).toLocaleString()}
                        </DialogDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select defaultValue={ticket.status} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900 dark:border-gray-700">
                                <SelectValue placeholder={t('admin.status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OPEN">{t('admin.statusOpen')}</SelectItem>
                                <SelectItem value="IN_PROGRESS">{t('admin.statusInProgress')}</SelectItem>
                                <SelectItem value="RESOLVED">{t('admin.statusResolved')}</SelectItem>
                                <SelectItem value="ESCALATED">{t('admin.statusEscalated')}</SelectItem>
                                <SelectItem value="PENDING">{t('admin.statusPending')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" title="Escalate" onClick={() => onStatusChange("ESCALATED")} className="dark:bg-gray-900 dark:border-gray-700">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                        </Button>
                    </div>
                </div>

                {/* Body: Chat & Sidebar */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 border-r dark:border-gray-800">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {ticket.messages && ticket.messages.map((msg: any) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.is_admin ? 'flex-row-reverse' : ''} ${msg.is_internal ? 'opacity-75' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.is_internal ? 'bg-yellow-100 dark:bg-yellow-900/30' : (msg.is_admin ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800')
                                        }`}>
                                        {msg.is_internal ? (
                                            <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                                        ) : (msg.is_admin ? (
                                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        ))}
                                    </div>
                                    <div className={`flex flex-col ${msg.is_admin ? 'items-end' : ''} w-full max-w-[80%]`}>
                                        <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.is_internal
                                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/40 dark:text-yellow-200'
                                            : (msg.is_admin
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-800 dark:text-gray-200')
                                            }`}>
                                            {msg.is_internal && <span className="font-bold block mb-1">{t('admin.supportSection.internalNote')}:</span>}
                                            {msg.message}
                                        </div>
                                        <div className={`text-xs text-gray-400 mt-1 ${msg.is_admin ? 'mr-2' : 'ml-2'}`}>
                                            {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex gap-2 mb-2">
                                <Button
                                    size="sm"
                                    variant={!isInternal ? "default" : "outline"}
                                    className={!isInternal ? "bg-blue-600 hover:bg-blue-700" : "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"}
                                    onClick={() => setIsInternal(false)}
                                >
                                    {t('admin.supportSection.replyToCustomer')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant={isInternal ? "secondary" : "outline"}
                                    onClick={() => setIsInternal(true)}
                                    className={isInternal ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:hover:bg-yellow-900/60" : "dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700"}
                                >
                                    {t('admin.supportSection.internalNote')}
                                </Button>
                            </div>
                            <div className={`relative rounded-xl border ${isInternal ? 'border-yellow-300 ring-4 ring-yellow-50' : 'border-gray-200 focus-within:ring-2 ring-blue-100 dark:border-gray-700 dark:focus-within:ring-blue-900/30'} transition-all bg-white dark:bg-gray-950`}>
                                <Textarea
                                    placeholder={isInternal ? t('admin.supportSection.placeholderInternal') : t('admin.supportSection.placeholderCustomer')}
                                    className="border-0 focus-visible:ring-0 min-h-[80px] resize-none py-3 dark:bg-gray-950 dark:text-gray-100 bg-transparent"
                                    value={isInternal ? internalNote : replyMessage}
                                    onChange={(e) => isInternal ? setInternalNote(e.target.value) : setReplyMessage(e.target.value)}
                                />
                                <div className="flex justify-between items-center p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
                                    <span className="text-xs text-gray-400">{t('admin.supportSection.markdownSupported')}</span>
                                    <Button size="sm" onClick={handleSend} className={isInternal ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-blue-600 hover:bg-blue-700"}>
                                        <Send className="w-3 h-3 mr-2" />
                                        {isInternal ? t('admin.supportSection.saveNote') : t('admin.supportSection.sendReply')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Customer Info */}
                    <div className="w-80 bg-gray-50 dark:bg-gray-900/30 p-6 border-l dark:border-gray-800 overflow-y-auto hidden md:block">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">{t('admin.supportSection.customerInfo')}</h4>

                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white font-bold">
                                        {ticket.user[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-gray-100">{ticket.user.full_name || ticket.user.username}</div>
                                        <div className="text-xs text-gray-500">{t('admin.supportSection.customerType')}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        <div className="text-gray-400">{t('admin.supportSection.totalSpent')}</div>
                                        <div className="font-bold text-green-600">1.2M</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        <div className="text-gray-400">{t('admin.supportSection.activeCourses')}</div>
                                        <div className="font-bold text-blue-600">4 {t('common.active')}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-bold text-xs text-gray-500 uppercase mb-3">{t('admin.supportSection.recentActivity')}</h5>
                                <div className="space-y-3">
                                    <div className="flex gap-3 text-xs">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium">{t('admin.courseCompleted')}</div>
                                            <div className="text-gray-500">Python Start (98%)</div>
                                            <div className="text-[10px] text-gray-400">2 days ago</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-xs">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium">{t('admin.olympiadRegistration')}</div>
                                            <div className="text-gray-500">Math Spring 2024</div>
                                            <div className="text-[10px] text-gray-400">5 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TicketDetailDialog;
