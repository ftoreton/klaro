import Icon from '@/components/ui/Icon';
import UserMenu from './UserMenu';

interface TopbarProps {
  title: string;
  project: string;
}

export default function Topbar({ title, project }: TopbarProps) {
  return (
    <div className="kb-top">
      <span className="crumbs">{project} ›</span>
      <span className="title">{title}</span>
      <span className="grow" />
      <Icon name="bell" size={16} color="var(--fg-muted)" />
      <UserMenu />
    </div>
  );
}
