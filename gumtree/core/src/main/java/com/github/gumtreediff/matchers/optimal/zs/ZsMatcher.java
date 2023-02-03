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

package com.github.gumtreediff.matchers.optimal.zs;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.simmetrics.ListDistance;
import org.simmetrics.ListMetric;
import org.simmetrics.StringMetric;
import org.simmetrics.StringMetrics;
import org.simmetrics.tokenizers.Tokenizers;

import com.github.gumtreediff.matchers.MappingStore;
import com.github.gumtreediff.matchers.Matcher;
import com.github.gumtreediff.tree.Tree;

public class ZsMatcher implements Matcher {

    private MappingStore mappings = null;
    private ZsTree zsSrc;
    private ZsTree zsDst;

    public double[][] treeDist;
    private double[][] forestDist;

    @Override
    public MappingStore match(Tree src, Tree dst, MappingStore mappings) {
        this.zsSrc = new ZsTree(src);
        this.zsDst = new ZsTree(dst);
        this.mappings = mappings;
        this.match();
        return mappings;
    }

    private static Tree getFirstLeaf(Tree t) {
        Tree current = t;
        while (!current.isLeaf())
            current = current.getChild(0);

        return current;
    }

    private double[][] computeTreeDist() {

        treeDist = new double[zsSrc.nodeCount + 1][zsDst.nodeCount + 1];
        forestDist = new double[zsSrc.nodeCount + 1][zsDst.nodeCount + 1];

        for (int i = 1; i < zsSrc.kr.length; i++)
            for (int j = 1; j < zsDst.kr.length; j++)
                forestDist(zsSrc.kr[i], zsDst.kr[j]);
        
        // System.out.println("====treeDist=====");
        // for (int i = 0; i < treeDist.length; i++){
        //     for (int j = 0; j < treeDist[0].length; j++)
        //         System.out.println(treeDist[i][j]+",");
        //     System.out.println("----------");
        // }
        // System.out.println("====forestDist=====");
        // for (int i = 0; i < forestDist.length; i++){
        //     for (int j = 0; j < forestDist[0].length; j++)
        //         System.out.println(forestDist[i][j]+",");
        //     System.out.println("----------");
        // }
        return treeDist;
    }

    private void forestDist(int i, int j) {
        forestDist[zsSrc.lld(i) - 1][zsDst.lld(j) - 1] = 0;
        for (int di = zsSrc.lld(i); di <= i; di++) {
            double costDel = getDeletionCost(zsSrc.tree(di));
            forestDist[di][zsDst.lld(j) - 1] = forestDist[di - 1][zsDst.lld(j) - 1] + costDel;
            for (int dj = zsDst.lld(j); dj <= j; dj++) {
                double costIns = getInsertionCost(zsDst.tree(dj));
                forestDist[zsSrc.lld(i) - 1][dj] = forestDist[zsSrc.lld(i) - 1][dj - 1] + costIns;

                if ((zsSrc.lld(di) == zsSrc.lld(i) && (zsDst.lld(dj) == zsDst.lld(j)))) {
                    double costUpd = getUpdateCost(zsSrc.tree(di), zsDst.tree(dj));
                    forestDist[di][dj] = Math.min(
                            Math.min(forestDist[di - 1][dj] + costDel, forestDist[di][dj - 1] + costIns),
                            forestDist[di - 1][dj - 1] + costUpd);
                    treeDist[di][dj] = forestDist[di][dj];
                } else {
                    forestDist[di][dj] = Math.min(
                            Math.min(forestDist[di - 1][dj] + costDel, forestDist[di][dj - 1] + costIns),
                            forestDist[zsSrc.lld(di) - 1][zsDst.lld(dj) - 1] + treeDist[di][dj]);
                }
            }
        }
    }

    public void match() {
        computeTreeDist();

        boolean rootNodePair = true;

        ArrayDeque<int[]> treePairs = new ArrayDeque<>();

        // push the pair of trees (ted1,ted2) to stack
        treePairs.addFirst(new int[] {zsSrc.nodeCount, zsDst.nodeCount});

        while (!treePairs.isEmpty()) {
            int[] treePair = treePairs.removeFirst();

            int lastRow = treePair[0];
            int lastCol = treePair[1];

            // compute forest distance matrix
            if (!rootNodePair)
                forestDist(lastRow, lastCol);

            rootNodePair = false;

            // compute mapping for current forest distance matrix
            int firstRow = zsSrc.lld(lastRow) - 1;
            int firstCol = zsDst.lld(lastCol) - 1;

            int row = lastRow;
            int col = lastCol;

            while ((row > firstRow) || (col > firstCol)) {
                if ((row > firstRow) && (forestDist[row - 1][col] + 1D == forestDist[row][col])) {
                    // node with postorderID row is deleted from ted1
                    row--;
                } else if ((col > firstCol) && (forestDist[row][col - 1] + 1D == forestDist[row][col])) {
                    // node with postorderID col is inserted into ted2
                    col--;
                } else {
                    // node with postorderID row in ted1 is renamed to node col
                    // in ted2
                    if ((zsSrc.lld(row) - 1 == zsSrc.lld(lastRow) - 1)
                            && (zsDst.lld(col) - 1 == zsDst.lld(lastCol) - 1)) {
                        // if both subforests are trees, map nodes
                        Tree tSrc = zsSrc.tree(row);
                        Tree tDst = zsDst.tree(col);
                        if (tSrc.getType() == tDst.getType())
                            mappings.addMapping(tSrc, tDst);
                        else
                            throw new RuntimeException("Should not map incompatible nodes.");
                        row--;
                        col--;
                    } else {
                        // pop subtree pair
                        treePairs.addFirst(new int[] {row, col});
                        // continue with forest to the left of the popped
                        // subtree pair

                        row = zsSrc.lld(row) - 1;
                        col = zsDst.lld(col) - 1;
                    }
                }
            }
        }
    }

    private double getDeletionCost(Tree n) {
        return 1D;
    }

    private double getInsertionCost(Tree n) {
        return 1D;
    }

    private double getUpdateCost(Tree n1, Tree n2) {
        if (n1.getType() == n2.getType())
            if ("".equals(n1.getLabel()) || "".equals(n2.getLabel()))
                return 1D;
            else{
                // System.out.println(n1.getLabel().replace("\n", "\\n").replace("\t", "\\t")+",");
                // System.out.println(n2.getLabel().replace("\n", "\\n").replace("\t", "\\t")+",");
                // StringMetric aaa = StringMetrics.createForListMetric(new BlockD<String>(),Tokenizers.qGramWithPadding(3));
                // System.out.println(1D - aaa.compare(n1.getLabel(), n2.getLabel()));
                return 1D - StringMetrics.qGramsDistance().compare(n1.getLabel(), n2.getLabel());}
        else
            return Double.MAX_VALUE;
    }
    public class BlockD<T> implements ListMetric<T>, ListDistance<T> {

        @Override
        public float compare(List<T> a, List<T> b) {
    
            if (a.isEmpty() && b.isEmpty()) {
                return 1.0f;
            }
    
            if (a.isEmpty() || b.isEmpty()) {
                return 0.0f;
            }
            // System.out.println("%%%%%%%%");
            // System.out.println(distance(a, b));
            // System.out.println(a.size());
            // System.out.println(b.size());
            return 1.0f - distance(a, b) / (a.size() + b.size());
        }
    
        @Override
        public float distance(final List<T> a, final List<T> b) {
            final Set<T> all = new HashSet<>(a.size() + b.size());
            all.addAll(a);
            all.addAll(b);
    
            int totalDistance = 0;
            for (T token : all) {
                int frequencyInA = java.util.Collections.frequency(a, token);
                int frequencyInB = java.util.Collections.frequency(b, token);
    
                totalDistance += java.lang.Math.abs(frequencyInA - frequencyInB);
            }
            return totalDistance;
        }
    
        @Override
        public String toString() {
            return "BlockDistance";
        }
    
    }

    private static final class ZsTree {
        private int nodeCount; // number of nodes

        private int leafCount;

        private int[] llds; // llds[i] stores the postorder-ID of the
        // left-most leaf descendant of the i-th node in postorder
        private Tree[] labels; // labels[i] is the tree of the i-th node in postorder

        private int[] kr;

        private ZsTree(Tree t) {
            this.nodeCount = t.getMetrics().size;
            this.leafCount = 0;
            this.llds = new int[nodeCount];
            this.labels = new Tree[nodeCount];

            int idx = 1;
            Map<Tree, Integer> tmpData = new HashMap<>();
            for (Tree n : t.postOrder()) {
                tmpData.put(n, idx);
                this.setITree(idx, n);
                this.setLld(idx, tmpData.get(getFirstLeaf(n)));
                if (n.isLeaf())
                    leafCount++;
                idx++;
            }

            setKeyRoots();
        }

        public void setITree(int i, Tree tree) {
            labels[i - 1] = tree;
            if (nodeCount < i)
                nodeCount = i;
        }

        public void setLld(int i, int lld) {
            llds[i - 1] = lld - 1;
            if (nodeCount < i)
                nodeCount = i;
        }

        public boolean isLeaf(int i) {
            return this.lld(i) == i;
        }

        public int lld(int i) {
            return llds[i - 1] + 1;
        }

        public Tree tree(int i) {
            return labels[i - 1];
        }

        public void setKeyRoots() {
            kr = new int[leafCount + 1];
            boolean[] visited = new boolean[nodeCount + 1];
            Arrays.fill(visited, false);
            int k = kr.length - 1;
            for (int i = nodeCount; i >= 1; i--) {
                if (!visited[lld(i)]) {
                    kr[k] = i;
                    visited[lld(i)] = true;
                    k--;
                }
            }
        }
    }
}
