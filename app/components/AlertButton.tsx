import { useRef, useState } from 'react';

export default function AlertButton() {
  const [time, setTime] = useState<NodeJS.Timeout>();
  const alertRef = useRef<HTMLButtonElement>(null);
  const onIn = () => {
    const timeout = setTimeout(() => {
      console.log('good');
    }, 4000);

    setTime(timeout);

    alertRef.current?.classList.add('before:right-0');
    alertRef.current?.classList.remove('before:right-full');
  };

  const onOut = () => {
    console.log('clear');
    alertRef.current?.classList.add('before:right-full');
    alertRef.current?.classList.remove('before:right-0');
    if (time) {
      clearTimeout(time);
    }
  };

  return (
    <button
      ref={alertRef}
      className="bg-orange-500 z-10 transform duration-[4000ms] ease-in-out before:content-[''] before:absolute before:-z-10 before:inset-y-0 before:left-0 before:right-full before:bg-red-500 before:transition-all before:duration-[4000ms] before:ease-in-out"
      onMouseDown={onIn}
      onTouchStart={onIn}
      onTouchEnd={onOut}
      onMouseUp={onOut}
      onMouseLeave={onOut}
    >
      Test
    </button>
  );
}
