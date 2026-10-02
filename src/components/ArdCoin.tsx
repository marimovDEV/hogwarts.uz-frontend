import { cn } from "@/lib/utils";

interface ArdCoinProps {
    amount?: number;
    className?: string;
    showAmount?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ArdCoin = ({ amount, className, showAmount = true, size = 'md' }: ArdCoinProps) => {
    const sizeClasses = {
        sm: "w-4 h-4 text-xs",
        md: "w-6 h-6 text-base",
        lg: "w-8 h-8 text-lg",
        xl: "w-12 h-12 text-2xl"
    };

    return (
        <div className={cn("inline-flex items-center gap-1.5 font-bold text-yellow-500", className)}>
            <style>
                {`
          @keyframes spin-y {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
          .animate-spin-y {
            animation: spin-y 3s linear infinite;
          }
        `}
            </style>
            <div className={cn(
                "relative flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-sm border border-yellow-200 dark:border-yellow-600 animate-spin-y",
                sizeClasses[size].split(' ')[0],
                sizeClasses[size].split(' ')[1]
            )}>
                {/* Inner detail for coin look */}
                <div className="absolute inset-[15%] rounded-full border border-yellow-100/50" />
                <span className="font-black text-white text-[10px] sm:text-xs drop-shadow-md">A</span>
            </div>

            {showAmount && amount !== undefined && (
                <span className={cn(sizeClasses[size].split(' ').slice(2).join(' '))}>
                    {Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ')} <span className="text-yellow-600 dark:text-yellow-400 text-[0.8em]">AC</span>
                </span>
            )}
        </div>
    );
};

export default ArdCoin;
