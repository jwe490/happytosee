import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  ChevronDown,
  Sparkles,
  Layout,
  Film,
  Compass,
  Star
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface PageSection {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

interface SectionManagerProps {
  sections: PageSection[];
  onReorder: (sections: PageSection[]) => void;
  onToggle: (sectionId: string) => void;
  onUpdateSettings: (sectionId: string, settings: Record<string, any>) => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  "hero": <Layout className="w-4 h-4" />,
  "mood-selector": <Sparkles className="w-4 h-4" />,
  "trending": <Star className="w-4 h-4" />,
  "discovery": <Compass className="w-4 h-4" />,
  "movies": <Film className="w-4 h-4" />,
};

interface SortableSectionProps {
  section: PageSection;
  onToggle: () => void;
  onUpdateSettings: (settings: Record<string, any>) => void;
}

function SortableSection({ section, onToggle, onUpdateSettings }: SortableSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border border-border bg-card transition-all",
        isDragging && "shadow-lg ring-2 ring-primary/20 z-50",
        !section.enabled && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 rounded-md hover:bg-muted cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          section.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {sectionIcons[section.type] || <Layout className="w-4 h-4" />}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{section.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={section.enabled}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${section.name}`}
          />
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </div>

      {/* Settings panel */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 pb-3 border-t border-border pt-3"
              >
                <SectionSettings
                  section={section}
                  onUpdate={onUpdateSettings}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}

function SectionSettings({ 
  section, 
  onUpdate 
}: { 
  section: PageSection; 
  onUpdate: (settings: Record<string, any>) => void;
}) {
  // Different settings based on section type
  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show search bar</Label>
            <Switch
              checked={section.settings.showSearch !== false}
              onCheckedChange={(v) => onUpdate({ showSearch: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Animated background</Label>
            <Switch
              checked={section.settings.animatedBg !== false}
              onCheckedChange={(v) => onUpdate({ animatedBg: v })}
            />
          </div>
        </div>
      );
    
    case "trending":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show ratings</Label>
            <Switch
              checked={section.settings.showRatings !== false}
              onCheckedChange={(v) => onUpdate({ showRatings: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Auto-scroll carousel</Label>
            <Switch
              checked={section.settings.autoScroll === true}
              onCheckedChange={(v) => onUpdate({ autoScroll: v })}
            />
          </div>
        </div>
      );

    case "mood-selector":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Compact mode</Label>
            <Switch
              checked={section.settings.compact === true}
              onCheckedChange={(v) => onUpdate({ compact: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show descriptions</Label>
            <Switch
              checked={section.settings.showDescriptions !== false}
              onCheckedChange={(v) => onUpdate({ showDescriptions: v })}
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-xs text-muted-foreground">
          No additional settings for this section.
        </p>
      );
  }
}

export function SectionManager({ 
  sections, 
  onReorder, 
  onToggle, 
  onUpdateSettings 
}: SectionManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      onReorder(newSections);
    }
  }, [sections, onReorder]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Page Sections</Label>
        <span className="text-xs text-muted-foreground">
          Drag to reorder
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggle={() => onToggle(section.id)}
                  onUpdateSettings={(settings) => onUpdateSettings(section.id, settings)}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
