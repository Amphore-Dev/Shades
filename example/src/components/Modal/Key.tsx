import { cn } from "../../utils";

interface IKeyProps {
  value: string;
  label?: string;
  square?: boolean;
}

export const Key: React.FC<IKeyProps> = ({ label, value, square = true }) => {
  const valueCont = (
    <div
      className={cn([
        `px-4 rounded-lg border text-current text-xl flex items-center justify-center border-neutral-400`,
        square && "aspect-square w-4",
      ])}
    >
      {value}
    </div>
  );

  if (!label) {
    return valueCont;
  }

  return (
    <div className="flex items-center gap-4">
      {valueCont}
      <span>{label}</span>
    </div>
  );
};
