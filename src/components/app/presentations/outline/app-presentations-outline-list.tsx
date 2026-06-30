import {
  AppPresentationsOutlineCard,
  type AppPresentationsOutlineCardItem,
} from "@/components/app/presentations/outline/app-presentations-outline-card";

interface AppPresentationsOutlineListProps {
  outlines: AppPresentationsOutlineCardItem[];
  onTitleChange: (id: string, value: string) => void;
  onDescriptionChange: (id: string, value: string) => void;
  onRepresentationChange: (id: string, value: number) => void;
}

export function AppPresentationsOutlineList({
  outlines,
  onTitleChange,
  onDescriptionChange,
  onRepresentationChange,
}: AppPresentationsOutlineListProps) {
  return (
    <div className="app-presentations-outline-list flex flex-col gap-4">
      {outlines.map((item) => (
        <AppPresentationsOutlineCard
          key={item.id}
          item={item}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onRepresentationChange={onRepresentationChange}
        />
      ))}
    </div>
  );
}
