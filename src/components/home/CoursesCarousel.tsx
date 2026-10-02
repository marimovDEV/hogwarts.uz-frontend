import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star, Clock } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/services/api";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from "react-i18next";
import { getSubjectTheme } from "@/lib/course-themes";
import { memo } from "react";

const CourseCard = memo(({ course, t }: { course: any; t: any }) => {
    return (
        <div className="group relative bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            <div className="aspect-video relative overflow-hidden">
                <img
                    src={course.image}
                    alt={course.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {course.category}
                    </Badge>
                </div>
            </div>

            <div className="p-4 md:p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(course.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                        ))}
                    </div>
                    <span className="text-xs font-medium bg-secondary px-2 py-1 rounded text-secondary-foreground">
                        {course.level}
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {course.duration}
                </div>

                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <span className="font-bold text-lg text-primary">
                        {t('popularCourses.free')}
                    </span>
                    <Button size="sm" asChild>
                        <Link to={`/course/${course.id}`}>
                            {t('popularCourses.details')}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
});

const CoursesCarousel = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    );

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const data = await homepageService.getFeaturedCourses();
                const coursesList = data.courses || data.results || data;

                if (Array.isArray(coursesList)) {
                    const mapped = coursesList.map((item: any) => {
                        const theme = getSubjectTheme(item.subject_name || item.subject || "");
                        return {
                            id: item.id,
                            title: item.title,
                            image: item.thumbnail || theme.fallbackImage,
                            category: item.subject_name || item.subject || item.level,
                            level: item.level_display || item.level,
                            rating: item.rating || 5.0,
                            duration: item.duration || "10 soat"
                        };
                    });
                    setCourses(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch featured courses:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (!isLoading && courses.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-muted/30">
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            {t('popularCourses.title')}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {t('popularCourses.subtitle')}
                        </p>
                    </div>
                    <Button variant="outline" asChild className="hidden md:flex">
                        <Link to="/all-courses">
                            {t('popularCourses.all')} <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <Carousel
                    plugins={[plugin.current]}
                    className="w-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="-ml-4">
                        {courses.map((course) => (
                            <CarouselItem key={course.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <CourseCard course={course} t={t} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                </Carousel>

                <div className="mt-8 text-center md:hidden">
                    <Button variant="outline" asChild className="w-full">
                        <Link to="/all-courses">
                            {t('popularCourses.all')} <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CoursesCarousel;
