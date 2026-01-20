import Image from 'next/image';
import { Person } from '@/types';

interface PersonCardProps {
    person: Person;
    role: string; // "Abuelo", "Padre", etc. (Calculated or passed)
}

export function PersonCard({ person, role }: PersonCardProps) {
    const displayName = `${person.first_name} ${person.last_name || ''}`.trim();
    const yearBirth = person.birth_date ? new Date(person.birth_date).getFullYear() : '?';
    const yearDeath = !person.is_living && person.death_date
        ? new Date(person.death_date).getFullYear()
        : (person.is_living ? 'Act.' : '?');

    return (
        <div className="flex flex-col items-center z-10">
            <div className="w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                    {person.photo_url ? (
                        <div className="size-16 rounded-full bg-center bg-cover border-2 border-primary/20 relative overflow-hidden">
                            <Image src={person.photo_url} alt={displayName} fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-primary/20">
                            <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
                        </div>
                    )}

                    <div className="text-center">
                        {role && <p className="text-primary text-[10px] font-bold uppercase tracking-wider">{role}</p>}
                        <p className="text-[#0d141b] dark:text-white text-sm font-bold truncate max-w-[160px]">{displayName}</p>
                        <p className="text-[#4c739a] text-[11px]">{yearBirth} - {yearDeath}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
