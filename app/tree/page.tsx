"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Person, PersonNode } from "@/types";
import { TreeVisualizer } from "@/components/TreeVisualizer";
import { BottomNav } from "@/components/BottomNav";

export default function TreePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [rootNode, setRootNode] = useState<PersonNode | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Check User
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                router.push("/");
                return;
            }

            // 2. Find User's Tree
            const { data: memberData, error: memberError } = await supabase
                .from("tree_members")
                .select("tree_id")
                .eq("user_id", user.id)
                .single();

            if (memberError || !memberData) {
                console.error("No tree found for user");
                // Handle case where user has no tree (shouldn't happen due to trigger)
                return;
            }

            // 3. Fetch People in Tree
            const { data: peopleData, error: peopleError } = await supabase
                .from("people")
                .select("*")
                .eq("tree_id", memberData.tree_id);

            if (peopleError) {
                console.error("Error fetching people", peopleError);
                return;
            }

            // 4. Build Tree Structure
            if (peopleData) {
                const tree = buildTreeFromFlatData(peopleData);
                setRootNode(tree);
            }
            setLoading(false);
        };

        fetchData();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between shadow-sm">
                    <div className="text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl">account_tree</span>
                        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold">Tu Árbol</h2>
                    </div>
                    <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white">
                        <span className="material-symbols-outlined">group</span>
                    </button>
                </div>
            </header>

            {/* Canvas */}
            <main className="flex-1 relative overflow-auto cursor-grab active:cursor-grabbing p-8 pt-32 pb-40">
                {/* Dot Grid Background */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {rootNode ? (
                    <div className="min-w-full flex justify-center z-10 relative">
                        <TreeVisualizer node={rootNode} />
                    </div>
                ) : (
                    <div className="text-center text-slate-500 mt-20">
                        No hay datos en el árbol.
                    </div>
                )}
            </main>

            {/* FAB - Add Member */}
            <button className="fixed right-6 bottom-24 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-30">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>

            <BottomNav />
        </div>
    );
}

// Logic to convert flat list of people into a hierarchical structure
// Heuristic: Find the person with NO parents (or the oldest?)
// For this V1, we will look for the "Yo" node (root of the perspective) or simply the first node with no parents.
function buildTreeFromFlatData(people: Person[]): PersonNode | null {
    if (people.length === 0) return null;

    // 1. Create Map of ID -> PersonNode
    const nodeMap = new Map<string, PersonNode>();
    people.forEach(p => {
        nodeMap.set(p.id, { ...p, children: [] });
    });

    // 2. Link Children to Parents
    const possibleRoots = new Set(nodeMap.keys());

    people.forEach(p => {
        // If I have a father, add me to father's children
        if (p.father_id && nodeMap.has(p.father_id)) {
            nodeMap.get(p.father_id)!.children.push(nodeMap.get(p.id)!);
            possibleRoots.delete(p.id); // I am not a root, I have a parent
        }
        // If I have a mother, add me to mother's children
        if (p.mother_id && nodeMap.has(p.mother_id)) {
            // Avoid double adding if already added via father (simple check)
            const mother = nodeMap.get(p.mother_id)!;
            if (!mother.children.find(child => child.id === p.id)) {
                mother.children.push(nodeMap.get(p.id)!);
            }
            possibleRoots.delete(p.id);
        }

        // Handle Spouse (just linking logic if we had spouse_id in schema, which we do)
        if (p.spouse_id && nodeMap.has(p.spouse_id)) {
            nodeMap.get(p.id)!.spouse = nodeMap.get(p.spouse_id)!;
        }
    });

    // 3. Select Root
    // Preference: Node named "Yo" -> Node with no parents -> First Node
    let rootId = Array.from(possibleRoots)[0];

    // If "Yo" is a root (has no parents yet), prioritize it.
    // If "Yo" has parents, it won't be in possibleRoots, so we'll pick the ancestor, which is correct implementation.
    const myself = people.find(p => p.first_name === 'Yo');
    if (myself && possibleRoots.has(myself.id)) {
        rootId = myself.id;
    }

    if (!rootId) return nodeMap.values().next().value || null; // Fallback

    return nodeMap.get(rootId) || null;
}
