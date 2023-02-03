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

package com.github.gumtreediff.io;

import com.github.gumtreediff.actions.EditScript;
import com.github.gumtreediff.actions.model.*;
import com.github.gumtreediff.io.TreeIoUtils.AbstractSerializer;
import com.github.gumtreediff.matchers.Mapping;
import com.github.gumtreediff.matchers.MappingStore;
import com.github.gumtreediff.tree.FakeTree;
import com.github.gumtreediff.tree.Tree;
import com.github.gumtreediff.tree.TreeContext;
import com.google.common.hash.BloomFilter;
import com.google.common.primitives.Chars;
import com.google.common.primitives.Ints;
import com.google.common.primitives.Longs;
import com.google.gson.stream.JsonWriter;

import it.unimi.dsi.fastutil.bytes.ByteList;

import javax.sound.sampled.AudioFormat.Encoding;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import org.apache.commons.codec.digest.DigestUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;
import java.nio.BufferUnderflowException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Consumer;
import java.util.function.Function;

import static com.github.gumtreediff.tree.TypeSet.type;

public final class ActionsIoUtils {

    private ActionsIoUtils() {
    }

    public static AbstractSerializer toText(TreeContext sctx, EditScript actions,
            MappingStore mappings, List<Long> times) throws IOException {
        return new ActionSerializer(sctx, mappings, actions, times) {

            @Override
            protected ActionFormatter newFormatter(TreeContext ctx, Writer writer) throws Exception {
                return new TextFormatter(ctx, writer);
            }
        };
    }

    public static AbstractSerializer toXml(TreeContext sctx, EditScript actions,
            MappingStore mappings, List<Long> times) throws IOException {
        return new ActionSerializer(sctx, mappings, actions, times) {

            @Override
            protected ActionFormatter newFormatter(TreeContext ctx, Writer writer) throws Exception {
                return new XmlFormatter(ctx, writer);
            }
        };
    }

    public static AbstractSerializer toJson(TreeContext sctx, EditScript actions,
            MappingStore mappings, List<Long> times) throws IOException {
        return new ActionSerializer(sctx, mappings, actions, times) {

            @Override
            protected ActionFormatter newFormatter(TreeContext ctx, Writer writer) throws Exception {
                return new JsonFormatter(ctx, writer);
            }
        };
    }

    public static AbstractSerializer toCompressed(TreeContext sctx, EditScript actions,
            MappingStore mappings, List<Long> times) throws IOException {
        return new CompressedComparableActionSerializer(sctx, mappings, actions, times);
    }

    public abstract static class ActionSerializer extends AbstractSerializer {
        final TreeContext context;
        final MappingStore mappings;
        final EditScript actions;
        final List<Long> times;

        ActionSerializer(TreeContext context, MappingStore mappings, EditScript actions, List<Long> times) {
            this.context = context;
            this.mappings = mappings;
            this.actions = actions;
            this.times = times;
        }

        protected abstract ActionFormatter newFormatter(TreeContext ctx, Writer writer) throws Exception;

        @Override
        public void writeTo(Writer writer) throws Exception {
            ActionFormatter fmt = newFormatter(context, writer);
            // Start the output
            fmt.startOutput();

            fmt.times(times);

            // Write the matches
            fmt.startMatches();
            for (Mapping m : mappings) {
                fmt.match(m.first, m.second);
            }
            fmt.endMatches();

            // Write the actions
            fmt.startActions();
            for (Action a : actions) {
                Tree src = a.getNode();
                if (a instanceof Move) {
                    Tree dst = mappings.getDstForSrc(src);
                    fmt.moveAction((Move) a, src, dst.getParent(), ((Move) a).getPosition());
                } else if (a instanceof Update) {
                    Tree dst = mappings.getDstForSrc(src);
                    fmt.updateAction((Update) a, src, dst);
                } else if (a instanceof Insert) {
                    Tree dst = a.getNode();
                    if (dst.isRoot())
                        fmt.insertRoot((Insert) a, src);
                    else
                        fmt.insertAction((Insert) a, src, dst.getParent(), dst.getParent().getChildPosition(dst));
                } else if (a instanceof Delete) {
                    fmt.deleteAction((Delete) a, src);
                } else if (a instanceof TreeInsert) {
                    Tree dst = a.getNode();
                    fmt.insertTreeAction((TreeInsert) a, src, dst.getParent(), dst.getParent().getChildPosition(dst));
                } else if (a instanceof TreeDelete) {
                    fmt.deleteTreeAction((TreeDelete) a, src);
                }

            }
            fmt.endActions();

            // Finish up
            fmt.endOutput();
        }
    }

    public static class CompressedComparableActionSerializer extends AbstractSerializer {
        final TreeContext context;
        final MappingStore mappings;
        final EditScript actions;
        final List<Long> times;

        CompressedComparableActionSerializer(TreeContext context, MappingStore mappings, EditScript actions,
                List<Long> times) {
            this.context = context;
            this.mappings = mappings;
            this.actions = actions;
            this.times = times;
        }

        HashMap<Tree, byte[]> filesCache = new HashMap<>();

        byte[] computeFile2(Tree t) {
            if (t == null) {
                throw new RuntimeException();
            } else if (filesCache.containsKey(t)) {
                return filesCache.get(t);
            } else if (t.getType() == type("directory")
                    || t.getType() == type("maven_directory")
                    || t.getType() == type("program")
                    || t.getType() == type("xml_source_file")) {
                Tree p = t.getParent();
                if (p == null || p.getLabel() == null || p.getLabel().length() == 0) {
                    if (t.getLabel().length()==0) {
                        byte[] r = new byte[16];
                        filesCache.put(t, r);
                        return r;
                    }
                    MessageDigest d = DigestUtils.getMd5Digest();
                    d.update(new byte[16]);
                        d.update((t.getLabel()).getBytes());
                    byte[] r = d.digest();
                    // if (t.getLabel() == "src") {
                    //     System.out.println("Arrays.toString(r)");
                    //     System.out.println(Arrays.toString(r));
                    // }
                    filesCache.put(t, r);
                    return r;
                } else if (p.getType() != type("directory") && p.getType() != type("maven_directory")) {
                    MessageDigest d = DigestUtils.getMd5Digest();
                    d.update(new byte[16]);
                    d.update((t.getLabel()).getBytes());
                    byte[] r = d.digest();

                    filesCache.put(t, r);
                    return r;
                } else {
                    MessageDigest d = DigestUtils.getMd5Digest();
                    d.update(computeFile2(p));
                    d.update((t.getLabel()).getBytes());
                    byte[] r = d.digest();
                    // if (t.getLabel() == "ControlFlowBuilder.java") {
                    //     System.out.println("ControlFlowBuilder.java");
                    //     System.out.println(Arrays.toString(r));
                    // }
                    filesCache.put(t, r);
                    return r;
                }
            } else {
                byte[] r = computeFile2(t.getParent());
                filesCache.put(t, r);
                return r;
            }
        }

        void hash(Tree t, MessageDigest d) {
            // d.update(t.getType().toString().getBytes());
            // if (t.hasLabel()) {
            // d.update(t.getLabel().getBytes());
            // }
            d.update(computeFile2(t));
            d.update(Ints.toByteArray(t.getPos()));
            d.update(Ints.toByteArray(t.getEndPos()));
        }

        // @Override
        // public void match(Tree srcNode, Tree destNode) throws Exception {
        // writer.beginObject();
        // writer.name("src").beginObject();
        // writer.name("type").value(srcNode.getType().toString());
        // if (srcNode.hasLabel()) {
        // writer.name("label").value(srcNode.getLabel());
        // }
        // writer.name("file").value(computeFile2(srcNode));
        // writer.name("start").value(srcNode.getPos());
        // writer.name("end").value(srcNode.getEndPos());
        // writer.endObject();
        // writer.name("dest").beginObject();
        // writer.name("type").value(destNode.getType().toString());
        // if (destNode.hasLabel()) {
        // writer.name("label").value(destNode.getLabel());
        // }
        // writer.name("file").value(computeFile2(destNode));
        // writer.name("start").value(destNode.getPos());
        // writer.name("end").value(destNode.getEndPos());
        // writer.endObject();
        // writer.endObject();
        // }

        @Override
        public void writeTo(Writer writer) throws Exception {
            throw new UnsupportedOperationException();
        }

        @Override
        public String toString() {
            throw new UnsupportedOperationException();
            // try (StringWriter s = new StringWriter()) {
            // writeTo(s);
            // return s.toString();
            // } catch (Exception e) {
            // throw new RuntimeException(e);
            // }
        }

        public void writeTo(String file) throws Exception {
            try (OutputStream w = new FileOutputStream(file)) {
                writeTo(w);
            }
        }

        public void writeTo(File file) throws Exception {
            try (OutputStream w = new FileOutputStream(file)) {
                writeTo(w);
            }
        }


        HashMap<Tree, byte[]> nodesCache = new HashMap<>();
        byte[] computeNode(Tree t) {
            if (t == null) {
                throw new RuntimeException();
            } else if (nodesCache.containsKey(t)) {
                // System.out.println(t);
                // System.out.println(Arrays.toString(nodesCache.get(t)));
                return nodesCache.get(t);
            } else {
                // System.out.println(t);
                Tree p = t.getParent();
                MessageDigest d = DigestUtils.getMd5Digest();
                if (p == null || p instanceof FakeTree) {
                    d.update(new byte[16]);
                    d.update(Ints.toByteArray(0));
                } else {
                    d.update(computeNode(p));
                    d.update(Ints.toByteArray(t.positionInParent()));
                }
                byte[] r = d.digest();
                // System.out.println(Arrays.toString(r));
                nodesCache.put(t, r);
                return r;
            }
        }

        @Override
        public void writeTo(OutputStream writer) throws Exception {
            // ActionFormatter fmt = newFormatter(context, writer);
            // Start the output
            // fmt.startOutput();
            // writer.write(Long.toHexString(0));
            writer.write(Ints.toByteArray(424242));
            if (actions == null) {
                System.out.println(-1);
                writer.write(Ints.toByteArray(-1));
            } else {
                System.out.println(actions.size());
                writer.write(Ints.toByteArray(actions.size()));
            }
            System.out.println(context.getMetadata("src_heap"));
            writer.write(Longs.toByteArray((long)context.getMetadata("src_heap")));
            System.out.println(context.getMetadata("dst_heap"));
            writer.write(Longs.toByteArray((long)context.getMetadata("dst_heap")));
            System.out.println(mappings.size());
            writer.write(Ints.toByteArray(mappings.size()));
            System.out.println(times.size());
            writer.write(Ints.toByteArray(times.size()));
            for (Long l : times) {
                writer.write(Longs.toByteArray(l));
            }

            int set_size = mappings.size();
            Double fp = 0.001;
            Double ln_pfp = Math.log(fp);
            Double ln_2 = Math.log(2);

            int optimal_num_hash_funcs = (int) Math.ceil(-(ln_pfp / ln_2));
            int optimal_vector_length = Math.max(100, (int) Math.ceil(-(set_size * ln_pfp / Math.pow(ln_2, 2))));

            System.out.println("blooming l, hf = " + optimal_vector_length + ", " + optimal_num_hash_funcs);

            writer.write(Ints.toByteArray(optimal_num_hash_funcs));
            writer.write(Ints.toByteArray(optimal_vector_length));

            BitSet s = new BitSet(optimal_vector_length);
            Consumer<Integer> f = idx -> s.set(Integer.remainderUnsigned(idx, optimal_vector_length));
            f.accept(0);
            f.accept(42);
            Consumer<byte[]> g = h -> {
                ByteBuffer b = ByteBuffer.wrap(h);
                int l1 = b.getInt();
                int l2 = b.getInt();
                int l3 = b.getInt();
                int l4 = b.getInt();
                // System.out.println(Integer.toUnsignedLong(l1));
                // System.out.println(Integer.toUnsignedLong(l2));
                // System.out.println(Integer.toUnsignedLong(l3));
                // System.out.println(Integer.toUnsignedLong(l4));
                if (optimal_num_hash_funcs >= 1)
                    f.accept((Integer.rotateLeft(l1 ^ l2, 2) ^ Integer.rotateRight(l3 ^ l4, 2)));
                if (optimal_num_hash_funcs >= 2)
                    f.accept((Integer.rotateLeft(l1 ^ l3, 2) ^ Integer.rotateRight(l2 ^ l4, 2)));
                if (optimal_num_hash_funcs >= 3)
                    f.accept((Integer.rotateLeft(l1 ^ l4, 2) ^ Integer.rotateRight(l2 ^ l3, 2)));
                if (optimal_num_hash_funcs >= 4)
                    f.accept(l1);
                if (optimal_num_hash_funcs >= 5)
                    f.accept(l2);
                if (optimal_num_hash_funcs >= 6)
                    f.accept(l3);
                if (optimal_num_hash_funcs >= 7)
                    f.accept(l4);
                if (optimal_num_hash_funcs >= 8)
                    f.accept(l2 ^ l1);
                if (optimal_num_hash_funcs >= 9)
                    f.accept(l3 ^ l4);
                if (optimal_num_hash_funcs >= 10)
                    f.accept(l2 ^ l3);
                if (optimal_num_hash_funcs >= 11)
                    f.accept(l1 ^ l4);
                if (optimal_num_hash_funcs >= 12)
                    f.accept(l1 ^ l2 ^ l3);
                if (optimal_num_hash_funcs >= 13)
                    f.accept(l1 ^ l2 ^ l4);
                if (optimal_num_hash_funcs > 13)
                    throw new RuntimeException(
                            "need more hashs l, hf = " + optimal_vector_length + ", " + optimal_num_hash_funcs);
            };
            g.accept(new byte[] {
                    0b1111111, 0b1111111, 0b1111111, 0b1111111,
                    0b1111111, 0b1111111, 0b1111111, 0b1111111,
                    0b1111111, 0b1111111, 0b1111111, 0b1111111,
                    0b1111111, 0b1111111, 0b1111111, 0b1111111
            });
            g.accept(new byte[] {
                    0b1111111, 0b1111111, 0b1111111, 0b1111111,
                    0b0000000, 0b0000000, 0b0000000, 0b0000000,
                    0b1111111, 0b1111111, 0b1111111, 0b1111111,
                    0b0000000, 0b0000000, 0b0000000, 0b0000000
            });
            g.accept(new byte[] {
                    0b0000000, 0b0000000, 0b0000000, 0b0000000,
                    0b1111111, 0b1111111, 0b1111111, 0b1111111,
                    0b0000000, 0b0000000, 0b0000000, 0b0000000,
                    0b1111111, 0b1111111, 0b1111111, 0b1111111
            });
            {
                MessageDigest h = DigestUtils.getMd5Digest();
                // System.out.println("Ints.toByteArray(42)");
                // System.out.println(Arrays.toString(Ints.toByteArray(42)));
                h.update(Ints.toByteArray(42));
                byte[] d = h.digest();
                // System.out.println(Arrays.toString(d));
                g.accept(d);
                MessageDigest h2 = DigestUtils.getMd5Digest();
                h2.update(d);
                h2.update(("/" + "file.txt").getBytes());
                byte[] d2 = h2.digest();
                System.out.println(Arrays.toString(d2));
                g.accept(d2);
            }
            // {
            //     System.out.println("simu adding trees");
            //     MessageDigest h = DigestUtils.getMd5Digest();
            //     // System.out.println(Arrays.toString(new byte[4]));
            //     h.update(new byte[4]);
            //     byte[] d = h.digest();
            //     // System.out.println(Arrays.toString(d));
            //     g.accept(d);
            // }
            // MessageDigest h = DigestUtils.getMd5Digest();
            // h.update(computeNode(m.first));
            // h.update(computeNode(m.second));
            // g.accept(h.digest());
            for (Mapping m : mappings) {
                MessageDigest h = DigestUtils.getMd5Digest();
                // using the file, start, end
                // hash(m.first, h);
                // hash(m.second, h);
                // using the path
                {
                    byte[] d = computeNode(m.first);
                    h.update(d);
                }
                {
                    byte[] d = computeNode(m.second);
                    h.update(d);
                }
                g.accept(h.digest());
            }
            System.out.println(s.size());
            byte[] ba = s.toByteArray();
            // writer.write(ba.length);
            writer.write(ba);
            System.out.println(ba.length);
            System.out.println(ba.length % 4);
            System.out.println(ba.length + 4 - ba.length % 4);
            System.out.println(optimal_vector_length / 8);
            System.out.println(s.size() / 8);
            int len = s.size() / 8 - ba.length;
            System.out.println(len);
            System.out.println(ba.length + len);
            System.out.println(ba.length + len % 8);
            writer.write(new byte[len]);
            // fmt.times(times);

            // // Write the matches
            // fmt.startMatches();
            // for (Mapping m: mappings) {
            // fmt.match(m.first, m.second);
            // }
            // fmt.endMatches();

            // // Write the actions
            // fmt.startActions();
            // for (Action a : actions) {
            // Tree src = a.getNode();
            // if (a instanceof Move) {
            // Tree dst = mappings.getDstForSrc(src);
            // fmt.moveAction((Move) a, src, dst.getParent(), ((Move) a).getPosition());
            // } else if (a instanceof Update) {
            // Tree dst = mappings.getDstForSrc(src);
            // fmt.updateAction((Update) a, src, dst);
            // } else if (a instanceof Insert) {
            // Tree dst = a.getNode();
            // if (dst.isRoot())
            // fmt.insertRoot((Insert) a, src);
            // else
            // fmt.insertAction((Insert) a, src, dst.getParent(),
            // dst.getParent().getChildPosition(dst));
            // } else if (a instanceof Delete) {
            // fmt.deleteAction((Delete) a, src);
            // } else if (a instanceof TreeInsert) {
            // Tree dst = a.getNode();
            // fmt.insertTreeAction((TreeInsert) a, src, dst.getParent(),
            // dst.getParent().getChildPosition(dst));
            // } else if (a instanceof TreeDelete) {
            // fmt.deleteTreeAction((TreeDelete) a, src);
            // }

            // }
            // fmt.endActions();

            // // Finish up
            // fmt.endOutput();
        }
    }

    interface ActionFormatter {
        void startOutput() throws Exception;

        void endOutput() throws Exception;

        void startMatches() throws Exception;

        void match(Tree srcNode, Tree destNode) throws Exception;

        void endMatches() throws Exception;

        void startActions() throws Exception;

        void insertRoot(Insert action, Tree node) throws Exception;

        void insertAction(Insert action, Tree node, Tree parent, int index) throws Exception;

        void insertTreeAction(TreeInsert action, Tree node, Tree parent, int index) throws Exception;

        void moveAction(Move action, Tree src, Tree dst, int index) throws Exception;

        void updateAction(Update action, Tree src, Tree dst) throws Exception;

        void deleteAction(Delete action, Tree node) throws Exception;

        void deleteTreeAction(TreeDelete action, Tree node) throws Exception;

        void endActions() throws Exception;

        void times(List<Long> times) throws Exception;
    }

    static class XmlFormatter implements ActionFormatter {
        final TreeContext context;
        final XMLStreamWriter writer;

        XmlFormatter(TreeContext context, Writer w) throws XMLStreamException {
            XMLOutputFactory f = XMLOutputFactory.newInstance();
            writer = new IndentingXMLStreamWriter(f.createXMLStreamWriter(w));
            this.context = context;
        }

        @Override
        public void startOutput() throws XMLStreamException {
            writer.writeStartDocument();
        }

        @Override
        public void endOutput() throws XMLStreamException {
            writer.writeEndDocument();
        }

        @Override
        public void startMatches() throws XMLStreamException {
            writer.writeStartElement("matches");
        }

        @Override
        public void match(Tree srcNode, Tree destNode) throws XMLStreamException {
            writer.writeEmptyElement("match");
            writer.writeAttribute("src", srcNode.toString());
            writer.writeAttribute("dest", destNode.toString());
        }

        @Override
        public void endMatches() throws XMLStreamException {
            writer.writeEndElement();
        }

        @Override
        public void startActions() throws XMLStreamException {
            writer.writeStartElement("actions");
        }

        @Override
        public void insertRoot(Insert action, Tree node) throws Exception {
            start(action, node);
            end(node);
        }

        @Override
        public void insertAction(Insert action, Tree node, Tree parent, int index) throws Exception {
            start(action, node);
            writer.writeAttribute("parent", parent.toString());
            writer.writeAttribute("at", Integer.toString(index));
            end(node);
        }

        @Override
        public void insertTreeAction(TreeInsert action, Tree node, Tree parent, int index) throws Exception {
            start(action, node);
            writer.writeAttribute("parent", parent.toString());
            writer.writeAttribute("at", Integer.toString(index));
            end(node);
        }

        @Override
        public void moveAction(Move action, Tree src, Tree dst, int index) throws XMLStreamException {
            start(action, src);
            writer.writeAttribute("parent", dst.toString());
            writer.writeAttribute("at", Integer.toString(index));
            end(src);
        }

        @Override
        public void updateAction(Update action, Tree src, Tree dst) throws XMLStreamException {
            start(action, src);
            writer.writeAttribute("label", dst.getLabel());
            end(src);
        }

        @Override
        public void deleteAction(Delete action, Tree node) throws Exception {
            start(action, node);
            end(node);
        }

        @Override
        public void deleteTreeAction(TreeDelete action, Tree node) throws Exception {
            start(action, node);
            end(node);
        }

        @Override
        public void endActions() throws XMLStreamException {
            writer.writeEndElement();
        }

        private void start(Action action, Tree src) throws XMLStreamException {
            writer.writeEmptyElement(action.getName());
            writer.writeAttribute("tree", src.toString());
        }

        private void end(Tree node) throws XMLStreamException {
            // writer.writeEndElement();
        }

        @Override
        public void times(List<Long> times) throws Exception {
        }
    }

    static class TextFormatter implements ActionFormatter {
        final Writer writer;
        final TreeContext context;

        public TextFormatter(TreeContext ctx, Writer writer) {
            this.context = ctx;
            this.writer = writer;
        }

        @Override
        public void startOutput() throws Exception {
        }

        @Override
        public void endOutput() throws Exception {
        }

        @Override
        public void startMatches() throws Exception {
        }

        @Override
        public void match(Tree srcNode, Tree destNode) throws Exception {
            write(String.format("===\nmatch\n---\n%s\n%s", toS(srcNode), toS(destNode)));
        }

        @Override
        public void endMatches() throws Exception {
        }

        @Override
        public void startActions() throws Exception {
        }

        @Override
        public void insertRoot(Insert action, Tree node) throws Exception {
            write(action.toString());
        }

        @Override
        public void insertAction(Insert action, Tree node, Tree parent, int index) throws Exception {
            write(action.toString());
        }

        @Override
        public void insertTreeAction(TreeInsert action, Tree node, Tree parent, int index) throws Exception {
            write(action.toString());
        }

        @Override
        public void moveAction(Move action, Tree src, Tree dst, int position) throws Exception {
            write(action.toString());
        }

        @Override
        public void updateAction(Update action, Tree src, Tree dst) throws Exception {
            write(action.toString());
        }

        @Override
        public void deleteAction(Delete action, Tree node) throws Exception {
            write(action.toString());
        }

        @Override
        public void deleteTreeAction(TreeDelete action, Tree node) throws Exception {
            write(action.toString());
        }

        @Override
        public void endActions() throws Exception {
        }

        private void write(String fmt, Object... objs) throws IOException {
            writer.append(fmt);
            writer.append("\n");
        }

        private String toS(Tree node) {
            return String.format("%s", node.toString());
        }

        @Override
        public void times(List<Long> times) throws Exception {
        }
    }

    static class JsonFormatter implements ActionFormatter {
        private final JsonWriter writer;

        JsonFormatter(TreeContext ctx, Writer writer) {
            this.writer = new JsonWriter(writer);
            this.writer.setIndent("  ");
        }

        @Override
        public void startOutput() throws IOException {
            writer.beginObject();
        }

        @Override
        public void endOutput() throws IOException {
            writer.endObject();
        }

        @Override
        public void startMatches() throws Exception {
            writer.name("matches").beginArray();
        }

        HashMap<Tree, String> filesCache = new HashMap<>();

        String computeFile2(Tree t) {
            if (t == null) {
                return "";
            } else if (filesCache.containsKey(t)) {
                return filesCache.get(t);
            } else if (t.getType() == type("directory")
                    || t.getType() == type("maven_directory")
                    || t.getType() == type("program")
                    || t.getType() == type("xml_source_file")) {
                Tree p = t.getParent();
                if (p == null || p.getLabel() == null || p.getLabel().length() == 0) {
                    return t.getLabel();
                } else if (p.getType() != type("directory") && p.getType() != type("maven_directory")) {
                    return t.getLabel();
                } else {
                    String r = computeFile2(t.getParent()) + "/" + t.getLabel();
                    filesCache.put(t, r);
                    return r;
                }
            } else {
                return computeFile2(t.getParent());
            }
        }

        @Override
        public void match(Tree srcNode, Tree destNode) throws Exception {
            writer.beginObject();
            writer.name("src").beginObject();
            writer.name("type").value(srcNode.getType().toString());
            if (srcNode.hasLabel()) {
                writer.name("label").value(srcNode.getLabel());
            }
            writer.name("file").value(computeFile2(srcNode));
            writer.name("start").value(srcNode.getPos());
            writer.name("end").value(srcNode.getEndPos());
            writer.endObject();
            writer.name("dest").beginObject();
            writer.name("type").value(destNode.getType().toString());
            if (destNode.hasLabel()) {
                writer.name("label").value(destNode.getLabel());
            }
            writer.name("file").value(computeFile2(destNode));
            writer.name("start").value(destNode.getPos());
            writer.name("end").value(destNode.getEndPos());
            writer.endObject();
            writer.endObject();
        }

        @Override
        public void endMatches() throws Exception {
            writer.endArray();
        }

        @Override
        public void startActions() throws IOException {
            writer.name("actions").beginArray();
        }

        @Override
        public void insertRoot(Insert action, Tree node) throws IOException {
            start(action, node);
            end(node);
        }

        @Override
        public void insertAction(Insert action, Tree node, Tree parent, int index) throws IOException {
            start(action, node);
            writer.name("parent").beginObject();
            writer.name("type").value(parent.getType().toString());
            if (parent.hasLabel()) {
                writer.name("label").value(parent.getLabel());
            }
            writer.name("file").value(computeFile2(parent));
            writer.name("start").value(parent.getPos());
            writer.name("end").value(parent.getEndPos());
            writer.endObject();
            writer.name("at").value(index);
            end(node);
        }

        @Override
        public void insertTreeAction(TreeInsert action, Tree node, Tree parent, int index) throws IOException {
            start(action, node);
            writer.name("parent").beginObject();
            writer.name("type").value(parent.getType().toString());
            if (parent.hasLabel()) {
                writer.name("label").value(parent.getLabel());
            }
            writer.name("file").value(computeFile2(parent));
            writer.name("start").value(parent.getPos());
            writer.name("end").value(parent.getEndPos());
            writer.endObject();
            writer.name("at").value(index);
            end(node);
        }

        @Override
        public void moveAction(Move action, Tree src, Tree dst, int index) throws IOException {
            start(action, src);
            writer.name("parent").beginObject();
            writer.name("type").value(dst.getType().toString());
            if (dst.hasLabel()) {
                writer.name("label").value(dst.getLabel());
            }
            writer.name("file").value(computeFile2(dst));
            writer.name("start").value(dst.getPos());
            writer.name("end").value(dst.getEndPos());
            writer.endObject();
            writer.name("at").value(index);
            end(src);
        }

        @Override
        public void updateAction(Update action, Tree src, Tree dst) throws IOException {
            start(action, src);
            writer.name("label").value(dst.getLabel());
            end(src);
        }

        @Override
        public void deleteAction(Delete action, Tree node) throws IOException {
            start(action, node);
            end(node);
        }

        @Override
        public void deleteTreeAction(TreeDelete action, Tree node) throws IOException {
            start(action, node);
            end(node);
        }

        private void start(Action action, Tree src) throws IOException {
            writer.beginObject();
            writer.name("action").value(action.getName());
            writer.name("tree").beginObject();
            writer.name("type").value(src.getType().toString());
            if (src.hasLabel()) {
                writer.name("label").value(src.getLabel());
            }
            writer.name("file").value(computeFile2(src));
            writer.name("start").value(src.getPos());
            writer.name("end").value(src.getEndPos());
            writer.endObject();
        }

        private void end(Tree node) throws IOException {
            writer.endObject();
        }

        @Override
        public void endActions() throws Exception {
            writer.endArray();
        }

        @Override
        public void times(List<Long> times) throws Exception {
            writer.name("times").beginArray();
            for (Long t : times) {
                writer.value(t);
            }
            writer.endArray();
        }
    }
}
