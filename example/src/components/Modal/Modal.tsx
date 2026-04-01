import { cn } from "../../utils";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  titleClassName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={
        "fixed inset-0 flex items-center justify-center z-50 top-0 left-0 w-full h-full p-4"
      }
    >
      <div
        className="modal-overlay absolute inset-0 bg-black opacity-50 z-10"
        onClick={onClose}
      />
      <div
        className={cn([
          "bg-neutral-950 p-8 rounded-2xl z-20 text-center flex flex-col gap-8 items-center",
          className,
        ])}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cn(["text-xl", titleClassName])}>{title}</h2>
        {children}
        <button
          className="border rounded-full w-fit px-4 cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
