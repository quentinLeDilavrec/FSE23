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
 * Copyright 2019 Jean-Rémy Falleri <jr.falleri@gmail.com>
 */

package com.github.gumtreediff.actions;

import com.github.gumtreediff.gen.TreeGenerators;
import com.github.gumtreediff.matchers.GumtreeProperties;
import com.github.gumtreediff.matchers.MappingStore;
import com.github.gumtreediff.matchers.Matcher;
import com.github.gumtreediff.matchers.Matchers;
import com.github.gumtreediff.matchers.TimedMatcher;
import com.github.gumtreediff.matchers.TimedMatcher.Timed;
import com.github.gumtreediff.tree.TreeContext;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Class to facilitate the computation of diffs between ASTs.
 */
public class Diff {
    /**
     * The source AST in its context.
     */
    public final TreeContext src;

    /**
     * The destination AST in its context.
     */
    public final TreeContext dst;

    /**
     * The mappings between the two ASTs.
     */
    public final MappingStore mappings;

    /**
     * The edit script between the two ASTs.
     */
    public final EditScript editScript;

    public final List<Long> timings;

    /**
     * Instantiate a diff object with the provided source and destination
     * ASTs, the provided mappings, and the provided editScript.
     */
    public Diff(TreeContext src, TreeContext dst,
                MappingStore mappings, EditScript editScript) {
        this.src = src;
        this.dst = dst;
        this.mappings = mappings;
        this.editScript = editScript;
        this.timings = null;
    }

    public Diff(TreeContext src, TreeContext dst,
                MappingStore mappings, EditScript editScript, List<Long> timings) {
            this.src = src;
            this.dst = dst;
            this.mappings = mappings;
            this.editScript = editScript;
            this.timings = timings;
        }

    /**
     * Compute and return a diff.
     * @param srcFile The path to the source file.
     * @param dstFile The path to the destination file.
     * @param treeGenerator The id of the tree generator to use.
     * @param matcher The id of the the matcher to use.
     * @param properties The set of options.
     * @throws IOException an IO exception is raised in case of IO problems related to the source
     *     or destination file.
     */
    public static Diff compute(String srcFile, String dstFile, String treeGenerator,
                               String matcher, GumtreeProperties properties, String diffAlgorithm) throws IOException {
                                Runtime runtime = Runtime.getRuntime();
        // Run the garbage collector
        runtime.gc();
        // Calculate the used memory
        long start_memory = runtime.totalMemory() - runtime.freeMemory();
        TreeContext src = TreeGenerators.getInstance().getTree(srcFile, treeGenerator);
        runtime.gc();
        long src_memory = start_memory - (runtime.totalMemory() - runtime.freeMemory());
        if (src.getMetadata("src_heap") != null)
            throw new RuntimeException();
        src.setMetadata("src_heap", src_memory);
        TreeContext dst = TreeGenerators.getInstance().getTree(dstFile, treeGenerator);
        runtime.gc();
        long dst_memory = start_memory - (runtime.totalMemory() - runtime.freeMemory());
        if (src.getMetadata("dst_heap") != null)
            throw new RuntimeException();
        src.setMetadata("dst_heap", dst_memory);
        // NOTE outside of the heap used by trees, measuring other data structure footprint would only reflect difference in languages (not approaches).
        // it might be useful to look at other memory metrics, but it's not trivial and even more between different languages and runtimes  

        Matcher m = Matchers.getInstance().getMatcherWithFallback(matcher);
        m.configure(properties);
        Timed timed;
        if (m instanceof TimedMatcher) {
            timed = ((TimedMatcher)m).timedMatch(src.getRoot(), dst.getRoot());
        } else {
            long t = System.nanoTime();
            MappingStore mappings = m.match(src.getRoot(), dst.getRoot());
            timed = new Timed(mappings, new ArrayList<>());
            timed.time.add(System.nanoTime() - t);
        }

        System.out.println("time taken to compute mappings: " + timed.time);
         
        // EditScript editScript = new SimplifiedChawatheScriptGenerator().computeActions(mappings);
        long t = System.nanoTime();
        EditScript editScript;
        if (diffAlgorithm.equals("Chawathe"))
            editScript= new ChawatheScriptGenerator().computeActions(timed.mappings);
        else if (diffAlgorithm.equals("None"))
            editScript = null;
        else if (diffAlgorithm.equals("SimplifiedChawathe"))
            editScript = new SimplifiedChawatheScriptGenerator().computeActions(timed.mappings);
        else
            editScript = new SimplifiedChawatheScriptGenerator().computeActions(timed.mappings);
        timed.time.add(System.nanoTime() - t);
        return new Diff(src, dst, timed.mappings, editScript, timed.time);
    }

    /**
     * Compute and return a diff.
     * @param srcFile The path to the source file.
     * @param dstFile The path to the destination file.
     * @param treeGenerator The id of the tree generator to use.
     * @param matcher The id of the the matcher to use.
     * @throws IOException an IO exception is raised in case of IO problems related to the source
     *     or destination file.
     */
    public static Diff compute(String srcFile, String dstFile,
                               String treeGenerator, String matcher) throws IOException {
        return compute(srcFile, dstFile, treeGenerator, matcher, new GumtreeProperties(), "SimplifiedChawathe");
    }

    /**
     * Compute and return a diff, using the default matcher and tree generators automatically
     * retrieved according to the file extensions.
     * @param srcFile The path to the source file.
     * @param dstFile The path to the destination file.
     * @throws IOException an IO exception is raised in case of IO problems related to the source
     *     or destination file.
     */
    public static Diff compute(String srcFile, String dstFile) throws IOException {
        return compute(srcFile, dstFile, null, null);
    }

    /**
     * Compute and return a all node classifier that indicates which node have
     * been added/deleted/updated/moved.
     */
    public TreeClassifier createAllNodeClassifier() {
        return new AllNodesClassifier(this);
    }

    /**
     * Compute and return a root node classifier that indicates which node have
     * been added/deleted/updated/moved. Only the root note is marked when a whole
     * subtree has been subject to a same operation.
     */
    public TreeClassifier createRootNodesClassifier() {
        return new OnlyRootsClassifier(this);
    }
}
