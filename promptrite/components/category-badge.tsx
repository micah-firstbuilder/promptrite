import { Code2, ImageIcon, Palette, Video } from "lucide-react";

type Category = "design" | "code" | "image" | "video";

interface CategoryBadgeProps {
  category: Category;
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({
  category,
  showIcon = true,
  className = "",
}: CategoryBadgeProps) {
  const getCategoryIcon = () => {
    switch (category) {
      case "design":
        return <Palette className="size-4 text-category-design" />;
      case "code":
        return <Code2 className="size-4 text-category-code" />;
      case "image":
        return <ImageIcon className="size-4 text-category-image" />;
      case "video":
        return <Video className="size-4 text-category-video" />;
    }
  };

  const getCategoryStyles = () => {
    switch (category) {
      case "design":
        return "bg-category-design/10 text-category-design ring-category-design/20";
      case "code":
        return "bg-category-code/10 text-category-code ring-category-code/20";
      case "image":
        return "bg-category-image/10 text-category-image ring-category-image/20";
      case "video":
        return "bg-category-video/10 text-category-video ring-category-video/20";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-xs capitalize ring-1 ring-inset ${getCategoryStyles()} ${className}`}
    >
      {showIcon && getCategoryIcon()}
      {category}
    </span>
  );
}
