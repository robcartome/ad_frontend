import { BrickWall, Cable, Drill, Hammer, HardHat, Paintbrush, Wrench } from 'lucide-react';

const icons = { drill: Drill, brick: BrickWall, pipe: Wrench, cable: Cable, paint: Paintbrush, helmet: HardHat };

export default function CategoryIcon({ type, size = 26, className }) {
  const Icon = icons[type] || Hammer;
  return <Icon size={size} strokeWidth={1.7} className={className} aria-hidden="true"/>;
}
