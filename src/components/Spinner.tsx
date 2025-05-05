type Props = {
  className?: string;
};

export default function Spinner({ className }: Props) {
  return (
    <div className={`flex items-center justify-center h-4 ${className}`}>
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
