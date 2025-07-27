import CheckIcon from "@heroicons/react/24/solid/CheckIcon";
import TagIcon from "@heroicons/react/24/solid/TagIcon";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../common/icon-button";

type LabelFilter = {
  name: string;
  checked: boolean;
};

interface LabelsFilterProps {
  data: LabelFilter[];
  onChange?: (data: LabelFilter) => void;
}

export function LabelsFilter({ data, onChange }: LabelsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  const toggleIsOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    const element = elementRef.current;
    const mousedownEventListener = (event: MouseEvent) => {
      if (element?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };
    window.addEventListener('mousedown', mousedownEventListener);
    return () => {
      window.removeEventListener('mousedown', mousedownEventListener);
    };
  }, []);

  return (
    <div className="relative" ref={elementRef}>
      <IconButton onClick={toggleIsOpen}>
        <TagIcon className="size-4" />
      </IconButton>
      {isOpen && (
        <div
          id="dropdownDelay"
          style={{
            inset: '30px auto auto 0px',
            position: 'absolute',
          }}
         className="absolute z-10 bg-[#373e47] divide-y divide-gray-100 rounded-lg shadow-sm w-40 border border-[#444c56]"
        >
          <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownDelayButton">
            {data.map(({ name, checked }) => (
              <li key={name} className="mx-2 cursor-pointer" onClick={() => onChange?.({ name, checked: !checked })}>
                <div className="flex items-center p-2 hover:bg-[#3d444e] text-[#adbac7] hover:text-[#e6edf3] rounded-md">
                  <div className="w-4 h-4 mr-2">
                    {checked ? <CheckIcon className="size-4" /> : null}
                  </div>
                  <span className="text-ellipsis overflow-hidden">{name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}``
