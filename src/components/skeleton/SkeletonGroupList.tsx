import SkeletonGroupCard from "./SkeletonGroupCard";

export default function SkeletonGroupList() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonGroupCard key={i} />
      ))}
    </div>
  );
}
