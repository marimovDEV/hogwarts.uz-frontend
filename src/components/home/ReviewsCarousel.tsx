import { Instagram, Play } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { homepageService } from "@/services/homepageService";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslation } from "react-i18next";
import Autoplay from "embla-carousel-autoplay";

const ReviewsCarousel = () => {
    const { t, i18n } = useTranslation();
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    );

    useEffect(() => {
        const fetchTestimonials = async () => {
            setIsLoading(true);
            try {
                const data = await homepageService.getTestimonials();
                const lang = i18n.language === 'ru' ? 'ru' : 'uz';
                const activeData = data.filter(d => d.is_active);

                const mapped = activeData.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    role: item.profession,
                    image: item.image, // Use uploaded thumbnail image
                    instagramUrl: item.instagram_url || 'https://instagram.com',
                    previewText: item[`text_${lang}`] || item.text_uz
                }));
                setReviews(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, [i18n.language]);

    if (!isLoading && reviews.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/20 container">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">{t('reviews.title', "O'quvchilarimiz Fikrlari")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('reviews.description', "Bizning kurslarimizni bitirib o'z maqsadiga erishgan o'quvchilar")}
                </p>
            </div>

            <Carousel
                plugins={[plugin.current]}
                opts={{
                    align: "center",
                    loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent className="-ml-4 py-4">
                    {reviews.map((review) => (
                        <CarouselItem key={review.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <a
                                href={review.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all hover:-translate-y-2"
                            >
                                {review.image ? (
                                    <img
                                        src={review.image}
                                        alt={review.name}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            // Fallback if Instagram thumbnail fails
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                            }
                                        }}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white opacity-50">{review.name.charAt(0)}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                                        <Play className="w-6 h-6 ml-1 fill-white" />
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 animate-bounce">
                                    <Instagram className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <p className="text-xs font-medium mb-1 line-clamp-2 opacity-90">{review.previewText}</p>
                                    <h4 className="font-bold">{review.name}</h4>
                                    <span className="text-xs text-white/70">{review.role}</span>
                                </div>
                            </a>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </section>
    );
};

export default ReviewsCarousel;
