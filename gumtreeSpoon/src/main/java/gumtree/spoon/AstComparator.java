package gumtree.spoon;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import com.github.gumtreediff.matchers.CompositeMatchers;
import com.github.gumtreediff.matchers.GumtreeProperties;
import com.github.gumtreediff.matchers.MappingStore;
import com.github.gumtreediff.matchers.Matcher;
import com.github.gumtreediff.tree.Tree;
import com.github.gumtreediff.tree.Type;
import com.github.gumtreediff.tree.TypeSet;

import gumtree.spoon.builder.SpoonGumTreeBuilder;
import gumtree.spoon.diff.Diff;
import gumtree.spoon.diff.DiffConfiguration;
import gumtree.spoon.diff.DiffImpl;
import spoon.MavenLauncher;
import spoon.SpoonModelBuilder;
import spoon.MavenLauncher.SOURCE_TYPE;
import spoon.compiler.SpoonResource;
import spoon.compiler.SpoonResourceHelper;
import spoon.reflect.declaration.CtElement;
import spoon.reflect.declaration.CtPackage;
import spoon.reflect.declaration.CtType;
import spoon.reflect.factory.Factory;
import spoon.reflect.factory.FactoryImpl;
import spoon.support.DefaultCoreFactory;
import spoon.support.StandardEnvironment;
import spoon.support.compiler.SpoonPom;
import spoon.support.compiler.VirtualFile;
import spoon.support.compiler.jdt.JDTBasedSpoonCompiler;

/**
 * Computes the differences between two CtElements.
 *
 * @author Matias Martinez, matias.martinez@inria.fr
 */
public class AstComparator {
	// For the moment, let's create a factory each type we get a type.
	// Sharing the factory produces a bug when asking the path of different types
	// (>1)
	// private final Factory factory;

	static {
		// default 0.3
		// it seems that default value is really bad
		// 0.1 one failing much more changes
		// 0.2 one failing much more changes
		// 0.3 one failing test_t_224542
		// 0.4 fails for issue31
		// 0.5 fails for issue31
		// 0.6 OK
		// 0.7 1 failing
		// 0.8 2 failing
		// 0.9 two failing tests with more changes
		// see GreedyBottomUpMatcher.java in Gumtree
		System.setProperty("gt.bum.smt", "0.6");

		// default 2
		// 0 is really bad for 211903 t_224542 225391 226622
		// 1 is required for t_225262 and t_213712 to pass
		System.setProperty("gt.stm.mh", "1");

		// default 1000
		// 0 fails
		// 1 fails
		// 10 fails
		// 100 OK
		// 1000 OK
		// see AbstractBottomUpMatcher#SIZE_THRESHOD in Gumtree
		// System.setProperty("gumtree.match.bu.size","10");
		// System.setProperty("gt.bum.szt", "1000");
	}
	/**
	 * By default, comments are ignored
	 */
	private boolean includeComments = false;

	public AstComparator() {
		super();
	}

	public AstComparator(boolean includeComments) {
		super();
		this.includeComments = includeComments;
	}

	public AstComparator(Map<String, String> configuration) {
		super();
		for (String k : configuration.keySet()) {
			System.setProperty(k, configuration.get(k));
		}
	}

	protected Factory createFactory() {
		Factory factory = new FactoryImpl(new DefaultCoreFactory(), new StandardEnvironment());
		factory.getEnvironment().setNoClasspath(true);
		factory.getEnvironment().setCommentEnabled(includeComments);
		return factory;
	}

	/**
	 * compares two java files
	 */
	public Diff compare(File f1, File f2) throws Exception {
		return this.compare(getCtType(f1), getCtType(f2));
	}

	/**
	 * compares two snippets
	 */
	public Diff compare(String left, String right) {
		return compare(getCtType(left), getCtType(right));
	}

	/**
	 * compares two java files
	 */
	public Diff compare(File f1, File f2, GumtreeProperties properties) throws Exception {
		return this.compare(getCtType(f1), getCtType(f2), properties);
	}

	/**
	 * compares two snippets
	 */
	public Diff compare(String left, String right, GumtreeProperties properties) {
		return compare(getCtType(left), getCtType(right), properties);
	}

	/**
	 * compares two snippets that come from the files given as argument
	 */
	public Diff compare(String left, String right, String filenameLeft, String filenameRight,
			GumtreeProperties properties) {
		return compare(getCtType(left, filenameLeft), getCtType(right, filenameRight), properties);
	}

	/**
	 * compares two snippets that come from the files given as argument
	 */
	public Diff compare(String left, String right, String filenameLeft, String filenameRight) {
		return compare(getCtType(left, filenameLeft), getCtType(right, filenameRight));
	}

	/**
	 * compares two AST nodes
	 */
	public Diff compare(CtElement left, CtElement right) {
		final SpoonGumTreeBuilder scanner = new SpoonGumTreeBuilder();
		return new DiffImpl(scanner.getTreeContext(), scanner.getTree(left), scanner.getTree(right));
	}

	/**
	 * compares two AST nodes
	 */
	public Diff compare(CtElement left, CtElement right, GumtreeProperties properties) {
		final SpoonGumTreeBuilder scanner = new SpoonGumTreeBuilder();
		return new DiffImpl(scanner.getTreeContext(), scanner.getTree(left), scanner.getTree(right), properties);
	}

	public Diff compare(File f1, File f2, DiffConfiguration configuration) throws Exception {
		final SpoonGumTreeBuilder scanner = new SpoonGumTreeBuilder();
		return new DiffImpl(
				scanner.getTreeContext(), scanner.getTree(getCtType(f1)), scanner.getTree(getCtType(f2)),
				configuration);
	}

	public CtType getCtType(File file) throws Exception {

		SpoonResource resource = SpoonResourceHelper.createResource(file);
		return getCtType(resource);
	}

	public CtType getCtType(SpoonResource resource) {
		Factory factory = createFactory();
		factory.getModel().setBuildModelIsFinished(false);
		SpoonModelBuilder compiler = new JDTBasedSpoonCompiler(factory);
		compiler.getFactory().getEnvironment().setLevel("OFF");
		compiler.addInputSource(resource);
		compiler.build();

		if (factory.Type().getAll().size() == 0) {
			return null;
		}

		// let's first take the first type.
		CtType type = factory.Type().getAll().get(0);
		// Now, let's ask to the factory the type (which it will set up the
		// corresponding
		// package)
		return factory.Type().get(type.getQualifiedName());
	}

	public CtType<?> getCtType(String content) {
		return getCtType(content, "/test");
	}

	public CtType<?> getCtType(String content, String filename) {
		VirtualFile resource = new VirtualFile(content, filename);
		return getCtType(resource);
	}

	public static void single(String[] args) throws Exception {
		if (args.length != 2) {
			System.out.println("Usage: DiffSpoon <dir_1>  <dir_2>");
			return;
		}
		// File file_1 = new File(args[0]);
		// File file_2 = new File(args[1]);
		MavenLauncher launcher1 = new MavenLauncher(args[0], SOURCE_TYPE.ALL_SOURCE, true);
		launcher1.getEnvironment().setComplianceLevel(11);
		launcher1.getEnvironment().setNoClasspath(true);
		launcher1.getFactory().getEnvironment().setComplianceLevel(11);
		launcher1.getFactory().getEnvironment().setNoClasspath(true);
		launcher1.getEnvironment().setLevel("INFO");
		launcher1.getFactory().getEnvironment().setLevel("INFO");
		launcher1.getEnvironment().setCommentEnabled(false);
		launcher1.getFactory().getEnvironment().setCommentEnabled(false);
		// MavenLauncher launcher1 = new MavenLauncher("/home/quentin/spoon",
		// SOURCE_TYPE.ALL_SOURCE, true);
		try {
			launcher1.buildModel();
		} catch (Exception e) {
			System.out.println(e);
		}
		Set<SpoonPom> modules = new HashSet<>();
		// MavenLauncher launcher1 = new MavenLauncher("/home/quentin/spoon",
		// SOURCE_TYPE.ALL_SOURCE, true);
		// MavenLauncher launcher2 = new MavenLauncher("/home/quentin/INRIA_spoon",
		// SOURCE_TYPE.ALL_SOURCE, true);
		SpoonPom pomFile = launcher1.getPomFile();
		List<SpoonPom> modulesPoms = pomFile.getModules();
		System.out.println(modulesPoms);
		for (SpoonPom pom : modulesPoms) {
			System.out.println(pom.toString());
			modules.add(pom);
		}
		// List<SpoonPom> profiles = pomFile.getModel().getProfiles();
		// Set<String> additionalModules = new LinkedHashSet();
		// for (Profile profile : profiles) {
		// if (ALL_MODULES_FROM_PROFILES
		// || (profile.getActivation() != null &&
		// profile.getActivation().isActiveByDefault())) {
		// additionalModules.addAll(profile.getModules());
		// }
		// }
		// for (String moduleName : additionalModules) {
		// SpoonPom pom = new SpoonPom(Paths.get(pomFile.getPath(),
		// moduleName).toString(), pomFile,
		// MavenLauncher.SOURCE_TYPE.APP_SOURCE, launcherCode.getEnvironment());
		// modules.add(extractedPrecise(src,
		// Paths.get(pom.getFileSystemParent().getAbsolutePath()), root, pom));
		// }
		MavenLauncher launcher2 = new MavenLauncher(args[1], SOURCE_TYPE.ALL_SOURCE, true);
		launcher2.getEnvironment().setComplianceLevel(11);
		launcher2.getEnvironment().setNoClasspath(true);
		launcher2.getFactory().getEnvironment().setComplianceLevel(11);
		launcher2.getFactory().getEnvironment().setNoClasspath(true);
		launcher2.getEnvironment().setLevel("INFO");
		launcher2.getFactory().getEnvironment().setLevel("INFO");
		launcher2.getEnvironment().setCommentEnabled(false);
		launcher2.getFactory().getEnvironment().setCommentEnabled(false);
		try {
			launcher2.buildModel();
		} catch (Exception e) {
			System.out.println(e);
		}
		Set<CtPackage> p_1 = launcher1.getModel().getRootPackage().getPackages();
		System.out.println(p_1.toString());
		Set<CtPackage> p_2 = launcher2.getModel().getRootPackage().getPackages();
		System.out.println(p_2.toString());

		final SpoonGumTreeBuilder scanner = new SpoonGumTreeBuilder();
		Tree tree1 = scanner.getTree(p_1.iterator().next());
		System.out.println("getTree");
		Tree tree2 = scanner.getTree(p_2.iterator().next());
		System.out.println("getTree");
		final Diff result = new DiffImpl(scanner.getTreeContext(), tree1, tree2);
		System.out.println(result.toString());
		System.out.println(result.getAllOperations().size());
		// final MappingStore mappingsComp = new MappingStore(tree1, tree2);
		// Matcher matcher = new CompositeMatchers.ClassicGumtree();
		// MappingStore mappings = matcher.match(tree1, tree2, mappingsComp);

		// System.out.println(mappings.toString());
	}

	public static void main(String[] args) throws Exception {
		many(args);
	}

	/**
	 * Computes the differences between multiple commits.
	 * 
	 * @author Quentin Le Dilavrec
	 */
	public static void many(String[] args) throws Exception {
		String dir = args[0];
		BufferedWriter writer = null;
		if (args.length > 1) {
			writer = new BufferedWriter(new FileWriter(args[1], true));
			writer.append(' ');
			writer.append("commit");
			writer.append(' ');
			writer.append("commit_after");
			writer.append(' ');
			writer.append("" + "size_before");
			writer.append(' ');
			writer.append("" + "size_after");
			writer.append(' ');
			writer.append("" + "success_mod_before");
			writer.append(' ');
			writer.append("" + "failed_mod_before");
			writer.append(' ');
			writer.append("" + "success_mod_after");
			writer.append(' ');
			writer.append("" + "failed_mod_after");
			writer.append(' ');
			writer.append(' ');
			writer.append("" + "time_before");
			writer.append(' ');
			writer.append("" + "time_after");
			writer.append(' ');
			writer.append("" + "diff_t");
			writer.append(' ');
			writer.append("" + "diff_size");
			writer.newLine();
			writer.flush();
		}
		BufferedReader reader = new BufferedReader(
				new InputStreamReader(System.in));
		// Set<CtPackage> p_after = null;
		Tree tree_after = null;
		String commit_after = null;
		int success_mod_after = 0;
		int failed_mod_after = 0;
		long time_after = 0;

		final SpoonGumTreeBuilder scanner = new SpoonGumTreeBuilder();
		while (true) {
			// MavenLauncher before = null;
			// Set<CtPackage> p_before = null;
			// Tree tree_before = null;

			// Reading data using readLine
			String commit;
			try {
				commit = reader.readLine();
			} catch (Exception e) {
				break;
			}
			if (commit == null)
				break;
			System.out.println(commit);
			Path directory = Path.of(dir);
			// I would have used jgit if it was less buggy...
			runCommand(directory, "git", "checkout", commit);
			Aux a = aux(dir, scanner);
			if (a == null) {
				commit_after = null;
				continue;
			}
			System.out.println("==============size=======" + a.size);
			
			Tree tree_before = a.tree_before;
			long compile_time = a.compile_time;

			if (commit_after == null) {
				// p_after = p_before;
				tree_after = tree_before;
				commit_after = commit;
				time_after = compile_time;
				success_mod_after = a.success_mod;
				failed_mod_after = a.failed_mod;
				continue;
			}
			long time = System.nanoTime();

			final Diff result = new DiffImpl(scanner.getTreeContext(), tree_before, tree_after);

			long diff_t = System.nanoTime() - time;
			// System.out.println(result.toString());
			System.out.println(
					commit + " " +
							commit_after + " " +
							tree_before.getMetrics().size + " " +
							tree_after.getMetrics().size + " " +
							compile_time + " " +
							time_after + " " +
							diff_t + " " +
							result.getAllOperations().size());
			// final MappingStore mappingsComp = new MappingStore(tree_before, tree_after);
			// Matcher matcher = new CompositeMatchers.ClassicGumtree();
			// MappingStore mappings = matcher.match(tree_before, tree_after, mappingsComp);

			// System.out.println(mappings.toString());

			if (writer != null) {
				writer.append(' ');
				writer.append(commit);
				writer.append(' ');
				writer.append(commit_after);
				writer.append(' ');
				writer.append("" + tree_before.getMetrics().size);
				writer.append(' ');
				writer.append("" + tree_after.getMetrics().size);
				writer.append(' ');
				writer.append("" + a.success_mod);
				writer.append(' ');
				writer.append("" + a.failed_mod);
				writer.append(' ');
				writer.append("" + success_mod_after);
				writer.append(' ');
				writer.append("" + failed_mod_after);
				writer.append(' ');
				writer.append("" + a.compile_time);
				writer.append(' ');
				writer.append("" + time_after);
				writer.append(' ');
				writer.append("" + diff_t);
				writer.append(' ');
				writer.append("" + result.getAllOperations().size());
				writer.newLine();
				writer.flush();
			}

			// p_after = p_before;
			tree_after = tree_before;
			commit_after = commit;
			time_after = compile_time;
			success_mod_after = a.success_mod;
			failed_mod_after = a.failed_mod;
		}

		writer.close();

	}

	static class Aux {
		long compile_time;
		Tree tree_before;
		int success_mod;
		int failed_mod;
		int size;
	}

	static Aux aux(String dir, SpoonGumTreeBuilder scanner) {
		Aux r = new Aux();
		long time = System.nanoTime();
		MavenLauncher launcher;
		try {
			launcher = new MavenLauncher(dir, SOURCE_TYPE.ALL_SOURCE, System.getenv().get("M2_HOME"), true);
		} catch (Exception e) {
			System.out.println(e);
			return null;
		}
		System.out.println(launcher.getPomFile().getModel());
		System.out.println(launcher.getPomFile().getSourceDirectories());
		System.out.println(launcher.getPomFile().getTestDirectories());

		launcher.getEnvironment().setComplianceLevel(11);
		launcher.getEnvironment().setNoClasspath(true);
		launcher.getEnvironment().setLevel("INFO");
		launcher.getEnvironment().setCommentEnabled(false);
		launcher.getFactory().getEnvironment().setComplianceLevel(11);
		launcher.getFactory().getEnvironment().setNoClasspath(true);
		launcher.getFactory().getEnvironment().setLevel("INFO");
		launcher.getFactory().getEnvironment().setCommentEnabled(false);

		SpoonPom pomFile = launcher.getPomFile();
		List<SpoonPom> modulesPoms = pomFile.getModules();

		if (modulesPoms.isEmpty()) {
			try {
				launcher.buildModel();
			} catch (Exception e) {
				System.out.println(e);
				r.failed_mod += 1;
				return null;
			}
			Set<CtPackage> p_before = launcher.getModel().getRootPackage().getPackages();
			System.out.println(p_before.toString());
			try {
				r.tree_before = scanner.getTree(p_before.iterator().next());
				r.size = r.tree_before.getMetrics().size;
				r.compile_time = System.nanoTime() - time;
				r.success_mod += 1;
			} catch (Exception e) {
				System.out.println(e);
				e.printStackTrace();
				r.failed_mod += 1;
			}
			return r;
		}

		System.out.println(modulesPoms);
		for (SpoonPom pom : modulesPoms) {
			System.out.println();
			System.out.println(pom.toString());
			System.out.println(pom.getName());
			System.out.println(pom.getPath());
			System.out.println(pom.getParent().getPath());
			System.out.println(pom.getParent().getName());
			Aux a = aux(pom.getPath(), scanner);
			if (a != null && a.tree_before != null) {
				String l = a.tree_before.getLabel();
				if (l != null)
					System.out.println(l);
				if (r.tree_before == null) {
					Type type = TypeSet.type("root");
					r.tree_before = scanner.getTreeContext().createTree(type);
				}
				r.failed_mod += a.failed_mod;
				r.success_mod += a.success_mod;
				r.compile_time += a.compile_time;
				r.size += a.size;
				a.tree_before.setLabel(pom.getParent().getName());
				r.tree_before.addChild(a.tree_before);
			}
		}
		return r;
	}

	public static void runCommand(Path directory, String... command) throws IOException, InterruptedException {
		Objects.requireNonNull(directory, "directory");
		if (!Files.exists(directory)) {
			throw new RuntimeException("can't run command in non-existing directory '" + directory + "'");
		}
		ProcessBuilder pb = new ProcessBuilder()
				.command(command)
				.directory(directory.toFile());
		Process p = pb.start();
		StreamGobbler errorGobbler = new StreamGobbler(p.getErrorStream(), "ERROR");
		StreamGobbler outputGobbler = new StreamGobbler(p.getInputStream(), "OUTPUT");
		outputGobbler.start();
		errorGobbler.start();
		int exit = p.waitFor();
		errorGobbler.join();
		outputGobbler.join();
		if (exit != 0) {
			throw new AssertionError(String.format("runCommand returned %d", exit));
		}
	}

	private static class StreamGobbler extends Thread {

		private final InputStream is;
		private final String type;

		private StreamGobbler(InputStream is, String type) {
			this.is = is;
			this.type = type;
		}

		@Override
		public void run() {
			try (BufferedReader br = new BufferedReader(new InputStreamReader(is));) {
				String line;
				while ((line = br.readLine()) != null) {
					System.out.println(type + "> " + line);
				}
			} catch (IOException ioe) {
				ioe.printStackTrace();
			}
		}
	}
}

