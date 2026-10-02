import { Outlet } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import AIChatWidget from "../AIChatWidget";

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-16 md:pt-20">
                <Outlet />
            </main>
            <Footer />
            <AIChatWidget />
        </div>
    );
};

export default PublicLayout;
