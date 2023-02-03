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

package com.github.gumtreediff.matchers;

import java.util.List;

import org.atteo.classindex.IndexSubclasses;

import com.github.gumtreediff.tree.Tree;

public interface TimedMatcher extends Matcher {

    public static class Timed {
        public List<Long> time;
        public MappingStore mappings;
        public Timed(MappingStore mappings,List<Long> time) {
            this.mappings = mappings;
            this.time = time;
        }
    }

    public Timed timedMatch(Tree src, Tree dst, MappingStore mappings);
    // return new Timed(match(src, dst, mappings), null);

    /**
     * Utility method that compute and return the mappings between a provided 
     * src and dst AST in a new mapping store.
     * 
     * @see #match(Tree, Tree, MappingStore) 
     */
    default Timed timedMatch(Tree src, Tree dst) {
        return timedMatch(src, dst, new MappingStore(src, dst));
    }
}
