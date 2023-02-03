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
 * Copyright 2018 Jean-Rémy Falleri <jr.falleri@gmail.com>
 */

package com.github.gumtreediff.gen.hyperast;

import com.github.gumtreediff.io.LineReader;
import com.github.gumtreediff.tree.Tree;
import com.github.gumtreediff.tree.Type;
import com.github.gumtreediff.tree.TypeSet;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.github.gumtreediff.tree.TreeContext;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.NoSuchElementException;

public class HyperAstVisitor {

    protected TreeContext context;

    private Deque<Tree> trees;

    private int pos = 0;

    public HyperAstVisitor() {
        this.context = new TreeContext();
        this.trees = new ArrayDeque<>();
    }

    public TreeContext getTreeContext() {
        return context;
    }

    public void visitPreOrder(JsonElement node) {
        if (node.isJsonPrimitive()) {
            String k = node.getAsString();
            push(TypeSet.type(k), null, this.pos, node.getAsString().length());
            this.pos += k.toCharArray().length;
        } else if (node.isJsonObject()) {
            JsonObject n = node.getAsJsonObject();
            String k = n.get("kind").getAsString();
            String l = null;
            if (n.has("label")) {
                l = n.get("label").getAsString();
                // l = l
                // .replace("\\b","\b").replace("\\f","\f")
                // .replace("\\n","\n").replace("\\r","\r")
                // .replace("\\t","\t")
                // .replace("\\\"","\"")
                // .replace("\\\\","\\")
                // ;
            }
            // if (k.equals("spaces")) {
            // this.pos += l.toCharArray().length;
            // return;
            // }
            if (k.equals("program")
                    || k.equals("directory")
                    || k.equals("maven_directory")
                    || k.equals("xml_source_file"))
                this.pos = 0;
            Tree t = push(TypeSet.type(k), l, this.pos, 0);
            // pushNode(n.get("kind").getAsString(), l, len);
            if (n.has("children")) {
                n.get("children").getAsJsonArray().forEach(this::visitPreOrder);
            } else if (!k.equals("directory") && !k.equals("program") && !k.equals("maven_directory")
                    && !k.equals("xml_source_file")) {
                this.pos += l.getBytes().length;
            }
            // if (k.equals("directory")) {
            // System.out.println(t);
            // }
            // if (k.equals("program")) {
            // System.out.println(t);
            // }
            // else if (k == "program") {

            // }
            if (k.equals("program") || k.equals("xml_source_file")) {
                t.setLength(this.pos - t.getPos());
            } else if (!k.equals("directory") && !k.equals("maven_directory")) {
                t.setLength(this.pos - t.getPos());
            }

        }
        if (trees.size() > 0)
            trees.pop();
    }

    protected Tree pushNode(String t, String label, int length) {
        try {
            // Position begin = n.getRange().get().begin;
            // Position end = n.getRange().get().end;
            // int startPos = reader.positionFor(begin.line, begin.column);
            // int length = reader.positionFor(end.line, end.column) - startPos + 1;
            return push(TypeSet.type(t), label, 0, 0);
        } catch (NoSuchElementException ignore) {
        }
        return null;
    }

    private Tree push(Type type, String label, int startPosition, int length) {
        Tree t = context.createTree(type, label);
        t.setPos(startPosition);
        t.setLength(length);

        if (trees.isEmpty())
            context.setRoot(t);
        else {
            Tree parent = trees.peek();
            t.setParentAndUpdateChildren(parent);
        }

        trees.push(t);
        return t;
    }
}
