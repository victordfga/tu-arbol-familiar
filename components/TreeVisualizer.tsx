import { PersonNode } from '@/types';
import { PersonCard } from './PersonCard';

interface TreeVisualizerProps {
    node: PersonNode;
    level?: number;
}

export function TreeVisualizer({ node }: TreeVisualizerProps) {
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center relative">
            <div className="flex gap-16 relative">
                {/* Main Person */}
                <PersonCard person={node} role="Familiar" />

                {/* Spouse (if any) - Simplified rendering side-by-side */}
                {node.spouse && (
                    <>
                        {/* Marriage Line */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-slate-300"></div>
                        <PersonCard person={node.spouse} role="Cónyuge" />
                    </>
                )}
            </div>

            {hasChildren && (
                <>
                    {/* Connector Down */}
                    <div className="h-8 w-[2px] bg-slate-300"></div>

                    {/* Connector Horizontal (only if multiple children) */}
                    {node.children.length > 1 && (
                        <div className="h-[2px] bg-slate-300 mb-0" style={{ width: `${(node.children.length - 1) * 160}px` }}></div>
                        /* Approximate width, ideally calculated dynamic */
                    )}

                    {/* Children Container */}
                    <div className="flex gap-4 pt-0">
                        {node.children.map((child, idx) => (
                            <div key={child.id} className="flex flex-col items-center relative px-4">
                                {/* Vertical line from sibling bar to child top */}
                                <div className="h-8 w-[2px] bg-slate-300 absolute -top-8 lg:-top-[1px] opacity-0"></div>
                                {/* NOTE: The horizontal + vertical line logic is tricky in pure CSS flex. 
                       For now, using a simple flex gap approach. 
                       Ideally we need SVG lines for perfect tree connector. 
                    */}

                                {/* Re-add vertical connector if not first generation (handled by parent logic usually) */}
                                {node.children.length > 1 && (
                                    <div className="h-8 w-[2px] bg-slate-300 -mt-[2px] mb-0"></div>
                                )}

                                <TreeVisualizer node={child} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
