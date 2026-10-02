import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Send, Youtube, Mail, Phone, MapPin, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    if (window.innerWidth < 768) {
      setOpenSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  const FooterSection = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <div className="border-b md:border-none border-border/50">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-4 md:py-0 md:mb-4 group text-left"
      >
        <h4 className="font-bold text-sm md:text-base uppercase tracking-wider text-foreground/90">
          {title}
        </h4>
        <ChevronDown
          className={`w-4 h-4 md:hidden transition-transform duration-300 ${openSections[id] ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="md:block hidden">
        {children}
      </div>

      <AnimatePresence>
        {openSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden md:hidden"
          >
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <footer className="bg-card border-t pt-8 md:pt-16 pb-6 md:pb-8">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">

          {/* Brand Column - Always Visible */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="Logo" className="h-8 w-auto" />
              <span className="text-2xl font-black font-cinzel tracking-wider text-primary">
                Hogwords
              </span>
            </Link>
            <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Send, href: "#", label: "Telegram" },
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Facebook, href: "#", label: "Facebook" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  title={social.label}
                  className="bg-muted p-2 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links and Contact - Grid changes on mobile */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-12">

            <FooterSection title={t('footer.courses_title')} id="courses">
              <ul className="space-y-2 text-sm text-muted-foreground/80">
                <li><Link to="/all-courses" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.all_courses')}</Link></li>
                <li><Link to="/all-courses?cat=programming" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.programming')}</Link></li>
                <li><Link to="/all-courses?cat=design" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.design')}</Link></li>
                <li><Link to="/all-courses?cat=languages" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.languages')}</Link></li>
                <li><Link to="/all-olympiads" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.olympiads')}</Link></li>
                <li><Link to="/pathways" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.pathways')}</Link></li>
              </ul>
            </FooterSection>

            <FooterSection title={t('footer.company_title')} id="company">
              <ul className="space-y-2 text-sm text-muted-foreground/80">
                <li><Link to="/about" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.about')}</Link></li>
                <li><Link to="/teachers" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.teachers')}</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.careers')}</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.blog')}</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors flex items-center gap-2"><span>&rsaquo;</span> {t('footer.contact_link')}</Link></li>
              </ul>
            </FooterSection>

            <FooterSection title={t('footer.contact_title')} id="contact">
              <ul className="space-y-4 text-sm text-muted-foreground/80">
                <li className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground/90">+998 90 123 45 67</span>
                    <span className="text-xs">+998 71 200 00 00</span>
                  </div>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground/90">info@olimpiada.uz</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="leading-tight pt-1">
                    {t('footer.address').split('\n').slice(0, 2).join('\n')}
                  </span>
                </li>
              </ul>
            </FooterSection>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground/60">
          <p className="font-medium">&copy; {new Date().getFullYear()} Hogwords. {t('footer.rights')}</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
