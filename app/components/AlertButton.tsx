import { useRef, useState } from 'react';

interface AlertButtonProps {
  children: React.ReactNode;
  onFinished: () => void;
}

export default function AlertButton({
  children,
  onFinished,
}: AlertButtonProps) {
  const [time, setTime] = useState<NodeJS.Timeout>();
  const alertRef = useRef<HTMLButtonElement>(null);

  const onIn = () => {
    const timeout = setTimeout(() => {
      onFinished();
    }, 4000);

    setTime(timeout);
  };

  const onOut = () => {
    if (time) {
      clearTimeout(time);
    }
  };

  return (
    <button
      ref={alertRef}
      style={{
        outline: 'none',
      }}
      className="cursor-pointer select-none active:select-none before:select-none overflow-hidden rounded-full p-3 font-semibold text-white w-full bg-orange-500 z-10 before:content-[''] before:absolute before:-z-10 before:inset-y-0 before:left-0 before:right-full active:before:right-0 before:bg-red-500 transform ease-in-out duration-300 before:transition-all active:before:duration-[4000ms]"
      onMouseDown={onIn}
      onTouchStart={onIn}
      onTouchEnd={onOut}
      onMouseUp={onOut}
      onMouseLeave={onOut}
    >
      {children}
    </button>
  );
}
