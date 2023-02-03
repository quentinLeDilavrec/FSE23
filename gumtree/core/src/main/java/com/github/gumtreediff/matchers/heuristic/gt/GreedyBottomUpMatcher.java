/*
 * This file is part of GumTree.
 *
 * GumTree is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GumTree is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with GumTree.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2011-2015 Jean-Rémy Falleri <jr.falleri@gmail.com>
 * Copyright 2011-2015 Floréal Morandat <florealm@gmail.com>
 */

package com.github.gumtreediff.matchers.heuristic.gt;

import java.util.List;

import com.github.gumtreediff.matchers.MappingStore;
import com.github.gumtreediff.matchers.SimilarityMetrics;
import com.github.gumtreediff.tree.Tree;

/**
 * Match the nodes using a bottom-up approach. It browses the nodes of the
 * source
 * and destination trees using a post-order traversal, testing if two
 * selected nodes might be mapped. The two nodes are mapped if they are mappable
 * and have a similarity greater than SIM_THRESHOLD. Whenever two trees
 * are mapped, an optimal TED algorithm is applied to look for possibly
 * forgotten
 * nodes.
 */
public class GreedyBottomUpMatcher extends AbstractBottomUpMatcher {
    @Override
    public MappingStore match(Tree src, Tree dst, MappingStore mappings) {
        // System.out.println("_mappings="+mappings);
        // int c = 0;
        // int c2 = 0;
        // System.out.println("_mappings="+mappings.size());
        for (Tree t : src.postOrder()) {
            // System.out.println("mappings="+mappings.size());
            // c++;
            // System.out.println("#"+(!(mappings.isSrcMapped(t) || t.isLeaf()))+" "+mappings.size()+" "+mappings.isSrcMapped(t)+" "+t.isLeaf()+" "+c);
            if (t.isRoot()) {
                // System.out.println("mapppings="+mappings.size());
                mappings.addMapping(t, dst);
                // System.out.println("mapppings="+mappings.size());
                lastChanceMatch(mappings, t, dst);
                // System.out.println("mapppings="+mappings.size());
                break;
            } else if (!(mappings.isSrcMapped(t) || t.isLeaf())) {
                // c2++;
                List<Tree> candidates = getDstCandidates(mappings, t);
                Tree best = null;
                double max = -1D;
                // System.out.println("%"+candidates.size()+" "+mappings.size()+" "+mappings.isSrcMapped(t)+" "+t.isLeaf()+" "+c);
                for (Tree cand : candidates) {
                    double sim = SimilarityMetrics.diceSimilarity(t, cand, mappings);
                    // System.out.println(SimilarityMetrics.numberOfMappedDescendants(t, cand, mappings));
                    if (sim > max && sim >= simThreshold) {
                        max = sim;
                        best = cand;
                    }
                }

                if (best != null) {
                    // System.out.println("mappppings="+mappings.size()+" sym = " + max);
                    lastChanceMatch(mappings, t, best);
                    mappings.addMapping(t, best);
                }
            }
        }
        // System.out.println("nodes:" + c + " mappings="+mappings.size());
        // System.out.println("nodes:" + c2);
        return mappings;
    }
}
