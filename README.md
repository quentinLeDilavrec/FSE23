# Reproduction package for "Computing Source Code Semantic Diffs at Scale"

## Content

### notebooks used for the evaluation
* `notebook_perfs/`
* `gumtree_validity/`

### snapshot of baseline (GumTree): `gumtree/`

* Follow the normal package build of gumtree

### snapshot of baseline for simple usecase (GumTree-Spoon): `gumtreeSpoon/`
First run the benchmark for simple usecase on our tool

* clone repositories in `instance/` 
* Follow the normal package build of gumtreeSpoon: `mvn package`
* run the script called `simp_gts.sh` with repo name as parameter

### our tool: `HyperAST/hyper_gumtree/`

* Build with `cargo build --release`
* Example command to run a benchmark
  * on `INRIA/spoon` starting at commit `ee73f4376aa929d8dce950202fabb8992a77c9fb`
```
target/release/window_combination INRIA/spoon "" ee73f4376aa929d8dce950202fabb8992a77c9fb "" validity_spoon.csv perfs_spoon.csv 2 Chawathe &> spoon.log
```

#### benchmark for simple usecase

* run the script called `simp_uc.sh` with repo's user and name, and commitid where it starts
