const NotificationCounter = ({ counter }: { counter: number }) => {
  return (
    <div className="flex h-7 w-7 rounded-full bg-error-light justify-center items-center">
      <p className="text-white font-bold">
        {counter >= 0 && <span>{counter}</span>}
      </p>
    </div>
  );
};

export default NotificationCounter;
