import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Clock,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";

const questions = [
  {
    id: 1,
    question: "Agar a + b = 10 va ab = 21 bo'lsa, a² + b² ning qiymati qanday?",
    options: ["58", "52", "48", "42"],
    correct: 0,
    time: 120,
  },
  {
    id: 2,
    question: "Uchburchakning ikkita tomoni 5 va 7 ga teng. Uchinchi tomon butun son bo'lsa, u qanday qiymatlar qabul qilishi mumkin?",
    options: ["3, 4, 5, 6, 7, 8, 9, 10, 11", "2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12", "3, 4, 5, 6, 7, 8, 9, 10, 11", "4, 5, 6, 7, 8, 9, 10"],
    correct: 2,
    time: 90,
  },
  {
    id: 3,
    question: "log₂(8) + log₃(27) = ?",
    options: ["5", "6", "7", "8"],
    correct: 1,
    time: 60,
  },
  {
    id: 4,
    question: "1 dan 100 gacha bo'lgan natural sonlar ichida 3 ga bo'linadigan sonlar nechta?",
    options: ["32", "33", "34", "35"],
    correct: 1,
    time: 45,
  },
  {
    id: 5,
    question: "f(x) = x² - 4x + 3 funksiyaning eng kichik qiymati qanday?",
    options: ["-2", "-1", "0", "1"],
    correct: 1,
    time: 90,
  },
];

const TestPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(questions[0].time);
  const [isFinished, setIsFinished] = useState(false);
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return questions[Math.min(currentQuestion + 1, questions.length - 1)]?.time || 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isFinished]);

  // Simulate tab switch warning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setWarnings((prev) => {
          const newWarnings = prev + 1;
          if (newWarnings >= 3) {
            setIsFinished(true);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFinished]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(questions[currentQuestion + 1].time);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return answer === questions[index].correct ? score + 20 : score;
    }, 0);
  };

  if (isFinished) {
    const score = calculateScore();
    const correctCount = answers.filter((a, i) => a === questions[i].correct).length;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-3xl p-8 shadow-strong text-center animate-scale-in">
          <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Test yakunlandi!</h1>
          <p className="text-muted-foreground mb-8">Sizning natijangiz</p>

          <div className="text-6xl font-bold gradient-text mb-4">{score}</div>
          <p className="text-muted-foreground mb-8">100 balldan</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-success/10 rounded-xl p-4">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">{correctCount}</div>
              <div className="text-sm text-muted-foreground">To'g'ri javoblar</div>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4">
              <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold">{questions.length - correctCount}</div>
              <div className="text-sm text-muted-foreground">Noto'g'ri javoblar</div>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="w-full">
                Dashboardga qaytish
              </Button>
            </Link>
            <Link to="/olympiads">
              <Button variant="outline" size="lg" className="w-full">
                Boshqa olimpiadalar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Matematika Olimpiadasi</h1>
                <p className="text-sm text-muted-foreground">
                  Savol {currentQuestion + 1}/{questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {warnings > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{warnings}/3 ogohlantirish</span>
                </div>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                timeLeft <= 10 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'
              }`}>
                <Clock className="w-5 h-5" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1 bg-muted mt-3 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card animate-fade-in">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {currentQuestion + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-bold">{question.question}</h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      answers[currentQuestion] === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-warning">
            <Flag className="w-5 h-5" />
            <span className="hidden sm:inline">Shikoyat</span>
          </button>

          <Button
            variant="hero"
            size="lg"
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
          >
            {currentQuestion < questions.length - 1 ? (
              <>
                Keyingisi
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Yakunlash
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default TestPage;
