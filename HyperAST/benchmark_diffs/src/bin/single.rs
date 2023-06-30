use hyper_ast::utils::memusage_linux;
use hyper_ast_cvs_git::preprocessed::PreProcessedRepository;
use num_traits::ToPrimitive;
use std::{
    env,
    io::{BufWriter, Write},
    path::PathBuf,
    str::FromStr, fs::File,
};

use hyper_ast_benchmark_diffs::{window_combination::windowed_commits_compare, other_tools, postprocess::{CompressedBfPostProcess, PathJsonPostProcess}};

#[cfg(not(target_env = "msvc"))]
use jemallocator::Jemalloc;

#[cfg(not(target_env = "msvc"))]
#[global_allocator]
static GLOBAL: Jemalloc = Jemalloc;


fn main() {
    let args: Vec<String> = env::args().collect();
    log::warn!("args: {:?}", args);
    let repo_name = args
        .get(1)
        .expect("give an argument like openjdk/jdk or INRIA/spoon"); //"openjdk/jdk";//"INRIA/spoon";
    let before = args.get(2).map_or("", |x| x);
    let after = args.get(3).map_or("", |x| x);
    let out = args.get(4).and_then(|x| {
        if x.is_empty() {
            None
        } else {
            Some(PathBuf::from_str(x).unwrap())
        }
    });
    let mut preprocessed = PreProcessedRepository::new(&repo_name);
    let processing_ordered_commits = preprocessed.pre_process_with_limit(
        &mut hyper_ast_cvs_git::git::fetch_github_repository(&preprocessed.name),
        before,
        after,
        "",
        2,
    );
    let oid_src = processing_ordered_commits[1];
    let oid_dst = processing_ordered_commits[0];
    log::warn!("diff of {oid_src} and {oid_dst}");

    let stores = &preprocessed.processor.main_stores;

    let commit_src = preprocessed.commits.get_key_value(&oid_src).unwrap();
    let time_src = commit_src.1.processing_time();
    let src_tr = commit_src.1.ast_root;
    use hyper_ast::types::WithStats;
    let src_s = stores.node_store.resolve(src_tr).size();

    let commit_dst = preprocessed.commits.get_key_value(&oid_dst).unwrap();
    let time_dst = commit_dst.1.processing_time();
    let dst_tr = commit_dst.1.ast_root;
    let dst_s = stores.node_store.resolve(dst_tr).size();

    let hyperast = hyper_ast_benchmark_diffs::window_combination::as_nospaces(stores);

    let mu = memusage_linux();
    let lazy = hyper_ast_benchmark_diffs::algorithms::gumtree_lazy::diff(&hyperast, &src_tr, &dst_tr);
    let summarized_lazy = &lazy.summarize();
    use hyper_ast_benchmark_diffs::algorithms::ComputeTime;
    let total_lazy_t: f64 = summarized_lazy.time();
    dbg!(summarized_lazy);
    log::warn!("ed+mappings size: {}", memusage_linux() - mu);
    log::warn!("done computing diff");
    println!(
        "{oid_src}/{oid_dst},{},{},{},{},{},{},{},{},{}",
        src_s,
        dst_s,
        Into::<isize>::into(&commit_src.1.memory_used()),
        Into::<isize>::into(&commit_dst.1.memory_used()),
        time_src,
        time_dst,
        summarized_lazy.mappings,
        total_lazy_t,
        summarized_lazy.actions.map_or(-1,|x|x as isize),
    );
    let diff_algorithm = "Chawathe";
    // let gt_out_format = "COMPRESSED"; // JSON
    let gt_out_format = "JSON"; // JSON
    let gt_out = other_tools::gumtree::subprocess(
        &hyperast.node_store,
        &hyperast.label_store,
        src_tr,
        dst_tr,
        "gumtree",
        diff_algorithm,
        (total_lazy_t * 10.).ceil().to_u64().unwrap(),
        gt_out_format,
    );
    if gt_out_format == "COMPRESSED" {
        if let Some(gt_out) = &gt_out {
            let pp = CompressedBfPostProcess::create(gt_out);
            let (pp, counts) = pp.counts();
            let (pp, gt_timings) = pp.performances();
            let valid = pp.validity_mappings(&lazy.mapper);
        }
    } else if gt_out_format == "JSON" {
        if let Some(gt_out) = &gt_out {
            let pp = hyper_ast_benchmark_diffs::postprocess::SimpleJsonPostProcess::new(&gt_out);
            let gt_timings = pp.performances();
            let counts = pp.counts();
            let valid = pp.validity_mappings(&lazy.mapper);
            dbg!(valid.additional_mappings.len());
            dbg!(valid.missing_mappings.len());
            // Some((gt_timings, counts, valid.map(|x| x.len())))
        }
    } else {
        unimplemented!("gt_out_format {} is not implemented", gt_out_format)
    };
}
