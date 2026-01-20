export type AppRole = 'admin' | 'editor' | 'viewer';

export interface Person {
    id: string;
    tree_id: string;
    first_name: string;
    last_name?: string;
    father_id?: string;
    mother_id?: string;
    spouse_id?: string;
    birth_date?: string;
    death_date?: string;
    is_living: boolean;
    gender?: 'Male' | 'Female' | 'Other';
    photo_url?: string;
    created_at: string;
}

// Extended type for the tree structure in memory
export interface PersonNode extends Person {
    children: PersonNode[];
    spouse?: PersonNode; // Simplification: one spouse for display
}
