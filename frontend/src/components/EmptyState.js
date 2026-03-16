import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={36} />
      </div>
      <h3 className="empty-state-title">{title || 'No data'}</h3>
      <p className="empty-state-text">{message || 'Nothing to show here'}</p>
      {action}
    </div>
  );
}
