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

import com.github.gumtreediff.gen.Register;
import com.github.gumtreediff.gen.Registry;
import com.github.gumtreediff.gen.SyntaxException;
import com.github.gumtreediff.gen.TreeGenerator;
import com.github.gumtreediff.io.LineReader;
import com.github.gumtreediff.tree.TreeContext;
import com.google.gson.Gson;
import com.google.gson.JsonElement;

import java.io.IOException;
import java.io.Reader;

@Register(id = "java-hyperast", accept = "\\.java$", priority = Registry.Priority.MEDIUM)
public class HyperAstGenerator extends TreeGenerator {

    @Override
    public TreeContext generate(Reader r) throws IOException {
        LineReader lr = new LineReader(r);
        try {
            JsonElement cu = new Gson().fromJson(lr,JsonElement.class);
            HyperAstVisitor v = new HyperAstVisitor();
            v.visitPreOrder(cu);
            return v.getTreeContext();
        }
        catch (Exception e) {
            throw new SyntaxException(this, r, e);
        }
    }
}
