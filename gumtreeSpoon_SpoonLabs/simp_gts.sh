#!/bin/bash
echo $1 $2

tail -n +2 ../HyperAST/batch_simple_usecase/$1.csv | awk -F'[,/]' '{print $2}' | head -n100 | /usr/bin/time -f "User:\n%U\nSys:\n%S\nElapsed:\n%E\nCpu:\n%P\nMaxMem:\n%M\nmajor page_faults:\n%F\nminor page_faults:\n%R" java -cp target/gumtree-spoon-ast-diff-SNAPSHOT-jar-with-dependencies.jar gumtree.spoon.AstComparator ../instances/$1 gtspoon_results_awk100/$1.csv &> gtspoon_results_awk100/$1.log

tail gtspoon_results_awk100/$1.log
