export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-8 pt-2 px-6 flex justify-between items-center z-40">
            <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">home</span>
                <span className="text-[10px] font-medium uppercase">Inicio</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-primary cursor-pointer">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_tree</span>
                <span className="text-[10px] font-bold uppercase">Árbol</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">forum</span>
                <span className="text-[10px] font-medium uppercase">Chat</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">settings</span>
                <span className="text-[10px] font-medium uppercase">Ajustes</span>
            </div>
        </nav>
    );
}
