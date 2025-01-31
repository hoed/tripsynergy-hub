import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  expiryMinutes?: number;
}

export function OTPInput({ length = 6, onComplete, expiryMinutes = 10 }: OTPInputProps) {
  const [value, setValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(expiryMinutes * 60);
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (value.length === length) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <InputOTP
        maxLength={length}
        value={value}
        onChange={(value) => setValue(value)}
        render={({ slots }) => (
          <InputOTPGroup className="gap-2">
            {slots.map((slot, index) => (
              <InputOTPSlot key={index} {...slot} index={index} />
            ))}
          </InputOTPGroup>
        )}
      />
      {timeLeft > 0 ? (
        <p className="text-sm text-muted-foreground">
          Code expires in: {formatTime(timeLeft)}
        </p>
      ) : (
        <p className="text-sm text-destructive">Code expired</p>
      )}
    </div>
  );
}