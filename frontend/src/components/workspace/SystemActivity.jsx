import { toast } from 'react-hot-toast';

const SystemActivity = () => {
  return (
    <div className="col-span-12 lg:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
        <h2 className="font-headline-md text-headline-md text-on-surface">System Activity</h2>
        <button 
          onClick={() => toast.success('Timeline is fully loaded')}
          className="text-primary font-label-sm text-label-sm hover:underline"
        >
          View Global Timeline
        </button>
      </div>
      <div className="p-lg flex-1 overflow-y-auto custom-scrollbar space-y-lg">
        {/* Activity Item 1 */}
        <div className="flex gap-md">
          <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-primary">call_merge</span>
          </div>
          <div>
            <p className="text-on-surface">
              <span className="font-semibold text-primary">Alex Chen</span> merged{' '}
              <code className="bg-surface-container-highest px-1 rounded text-primary text-xs">
                feature/auth-provider
              </code>{' '}
              into{' '}
              <code className="bg-surface-container-highest px-1 rounded text-xs">
                main
              </code>
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              12 minutes ago • Core-Auth Project
            </p>
          </div>
        </div>
        {/* Activity Item 2 */}
        <div className="flex gap-md">
          <div className="w-8 h-8 rounded-full border border-error/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-error">error</span>
          </div>
          <div>
            <p className="text-on-surface">
              <span className="font-semibold text-error">System Alert:</span> High latency detected in{' '}
              <span className="underline decoration-error/40">US-East-1 Edge Nodes</span>
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              45 minutes ago • Infrastructure
            </p>
          </div>
        </div>
        {/* Activity Item 3 */}
        <div className="flex gap-md">
          <div className="w-8 h-8 rounded-full border border-tertiary/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-tertiary">edit_note</span>
          </div>
          <div>
            <p className="text-on-surface">
              <span className="font-semibold text-on-surface">Sarah Miller</span> updated documentation for{' '}
              <span className="italic text-tertiary">"Quantum API Interface"</span>
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              2 hours ago • API Docs
            </p>
          </div>
        </div>
        {/* Activity Item 4 */}
        <div className="flex gap-md">
          <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-primary">person_add</span>
          </div>
          <div>
            <p className="text-on-surface">
              <span className="font-semibold">Jordan Blake</span> was added as a Maintainer
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              5 hours ago • Team Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemActivity;
